"""Decision Reconstruction Service for WHY.

Reconstructs historical organizational decisions strictly from memories retrieved
from Hindsight persistent memory, using evidence-first LLM reasoning.
"""

import json
import re
from typing import Any, Dict, List, Optional, Set
from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.memory.hindsight import HindsightMemoryService
from app.schemas.decision import (
    DecisionAlternative,
    DecisionConflict,
    DecisionExplanation,
    DecisionReason,
    DecisionStatusEnum,
    DecisionTimeframe,
    EvidenceItem,
    MemoryMode,
    PreviousInvestigationItem,
)
from app.services.base import BaseService
from app.services.decision_memory_service import DecisionMemoryService
from app.services.llm_service import BaseLLMService, get_llm_service


class DecisionReconstructionService(BaseService):
    """Reconstructs organizational decisions from Hindsight memories using LLM reasoning."""

    SYSTEM_PROMPT = """You are an organizational decision reconstruction agent for the WHY system.
Your mission is to reconstruct why an architectural or business decision was made, strictly based on the provided historical memories retrieved from organizational records.

STRICT EVIDENCE & EPISTEMIC RULES:
1. Use ONLY the supplied historical memories as evidence.
2. DO NOT invent, assume, extrapolate, or hallucinate facts or reasons that are not supported by the evidence.
3. If the evidence is insufficient to answer the question, state 'Insufficient historical evidence to reconstruct this decision.' in summary and 'Unknown / Insufficient Evidence' in decision.
4. For every item in 'reasons', you MUST cite the specific 'evidence_ids' (e.g. 'ADR-014', 'PAY-1042', 'SLACK-001') that directly support it. If a reason is an inference without direct evidence, set 'evidence_ids' to an empty list [].
5. For every item in 'alternatives', provide the name of the alternative, the specific reason it was not selected, and supporting 'evidence_ids'.
6. Extract known constraints, participants, dependencies, and timeframe (start and end periods) from the evidence.
7. If recalled evidence contains contradictory statements, DO NOT choose one silently. Record every inconsistency in 'conflicts' with 'topic', 'statements', and 'evidence_ids'.
8. You must return ONLY a single, valid JSON object matching the requested schema. No conversational prose or markdown wrap outside the JSON.
9. EPISTEMIC HYGIENE: If PREVIOUS WHY INVESTIGATION MEMORY is provided, treat it strictly as prior AI reasoning for context. PRIMARY ORGANIZATIONAL EVIDENCE always takes absolute priority. Do NOT cite previous WHY investigations as source document IDs in reasons.evidence_ids. If primary evidence conflicts with previous WHY reasoning, PRIMARY EVIDENCE WINS.
"""

    def __init__(
        self,
        memory_service: Optional[HindsightMemoryService] = None,
        llm_service: Optional[BaseLLMService] = None,
        decision_memory_service: Optional[DecisionMemoryService] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.memory_service = memory_service or HindsightMemoryService(settings=self.settings)
        self.llm_service = llm_service or get_llm_service(settings=self.settings)
        self.decision_memory_service = decision_memory_service or DecisionMemoryService(
            memory_service=self.memory_service,
            settings=self.settings,
        )
        logger.info(
            "Initialized DecisionReconstructionService (Bank: %s, LLM Model: %s)",
            self.settings.HINDSIGHT_BANK_ID,
            self.settings.LLM_MODEL,
        )

    async def reconstruct_decision(
        self,
        question: str,
        bank_id: Optional[str] = None,
        limit: int = 15,
        memory_mode: MemoryMode = MemoryMode.HINDSIGHT,
    ) -> DecisionExplanation:
        """Execute full decision reconstruction pipeline: Recall -> Package -> Prompt -> Parse -> Validate."""
        clean_question = question.strip()
        if not clean_question:
            raise ValueError("Question cannot be empty.")

        # Step 0: Controlled no-memory mode evaluation
        if memory_mode == MemoryMode.NONE or str(memory_mode).lower() == "none":
            logger.info("Executing reconstruction in NO-MEMORY mode for '%s' (Hindsight recall completely bypassed).", clean_question)
            return DecisionExplanation(
                question=clean_question,
                decision="Unknown / Insufficient Evidence (No Memory)",
                summary="WHY has no organizational memory available for this investigation, so it cannot reconstruct the historical decision without inventing facts.",
                reasons=[],
                alternatives=[],
                constraints=[],
                evidence=[],
                participants=[],
                dependencies=[],
                timeframe=None,
                conflicts=[],
                confidence=0.0,
                confidence_rationale="Bypassed Hindsight persistent memory layer as part of controlled comparison test.",
                source_documents=[],
                prior_investigations=[],
                prior_investigations_count=0,
                decision_id="dec-no-memory",
                title="No Memory Available",
                status=DecisionStatusEnum.INSUFFICIENT_EVIDENCE,
                why_summary="Insufficient historical evidence to reconstruct this decision without organizational memory.",
                original_rationale=[],
            )

        target_bank = bank_id or self.settings.HINDSIGHT_BANK_ID
        logger.info("Reconstructing decision for query '%s' in bank '%s'", clean_question, target_bank)

        # Step 1: Recall relevant memories from Hindsight
        memories = await self.memory_service.arecall_memories(
            query=clean_question,
            bank_id=target_bank,
            limit=limit,
        )

        logger.info("Recalled %d memories from Hindsight for '%s'", len(memories), clean_question)

        # Step 1b: Recall previous WHY investigations from Hindsight persistent memory
        prior_investigations: List[PreviousInvestigationItem] = []
        try:
            prior_investigations = await self.decision_memory_service.arecall_previous_investigations(
                question=clean_question,
                bank_id=target_bank,
                limit=3,
            )
            logger.info("Recalled %d prior WHY investigations for '%s'", len(prior_investigations), clean_question)
        except Exception as exc:
            logger.warning("Failed to recall prior investigations (continuing with primary evidence): %s", exc)

        # Separate primary organizational evidence from any raw investigation memories
        primary_memories = [
            m for m in memories
            if (m.source_type or "").lower() != "decision_investigation"
            and "[why decision investigation memory]" not in (m.content or "").lower()
        ]
        evidence_to_use = primary_memories if primary_memories else memories

        # Step 2: Handle insufficient evidence
        if not evidence_to_use or all(not (m.content and m.content.strip()) for m in evidence_to_use):
            logger.warning("No memories found for question '%s'. Returning insufficient evidence response.", clean_question)
            return self._build_insufficient_evidence_response(clean_question)

        # Check for superficial or completely irrelevant recall (e.g. question asks for AWS Lambda 2023 when memories are empty or unrelated)
        stop_words = {
            "why", "did", "the", "for", "and", "was", "how", "what", "when", "where", "which",
            "choose", "select", "use", "using", "make", "decision", "decide", "finflow",
            "in", "with", "from", "that", "this", "our", "are", "were", "been", "have", "has", "had"
        }
        subject_keywords = [
            w.lower() for w in re.findall(r"\b[A-Za-z0-9_-]{3,}\b", clean_question)
            if w.lower() not in stop_words
        ]
        all_mem_text = " ".join((m.content or "") + " " + (m.title or "") for m in evidence_to_use).lower()
        matching_subject_keywords = [k for k in subject_keywords if k in all_mem_text]

        if subject_keywords and len(matching_subject_keywords) == 0:
            logger.info("Recalled memories contain 0 subject keyword matches for question '%s'. Insufficient evidence.", clean_question)
            return self._build_insufficient_evidence_response(clean_question, evidence=evidence_to_use)

        # Step 3: Prepare Evidence Package with explicit section demarcation
        evidence_package = self._format_evidence_package(evidence_to_use, prior_investigations=prior_investigations)

        # Step 4: Construct Evidence-First LLM Prompt
        prompt = self._build_reconstruction_prompt(clean_question, evidence_package)

        # Step 5: Execute LLM reasoning
        logger.info("Invoking LLM for structured decision reconstruction...")
        raw_llm_output = await self.llm_service.generate(
            prompt=prompt,
            system_prompt=self.SYSTEM_PROMPT,
            response_format={"type": "json_object"},
        )

        # Step 6: Parse structured JSON
        parsed_data = self._parse_llm_json(raw_llm_output)

        # Step 7: Check if LLM itself determined evidence was insufficient
        summary_text = parsed_data.get("summary", "")
        decision_text = parsed_data.get("decision", "")
        if "insufficient" in summary_text.lower() or "insufficient" in decision_text.lower():
            logger.info("LLM evaluated evidence as insufficient for '%s'.", clean_question)
            return self._build_insufficient_evidence_response(clean_question, evidence=evidence_to_use)

        # Step 8: Validate and sanitize evidence citations
        valid_doc_ids = self._extract_valid_document_ids(evidence_to_use)
        reasons = self._sanitize_reasons(parsed_data.get("reasons", []), valid_doc_ids)
        alternatives = self._sanitize_alternatives(parsed_data.get("alternatives", []), valid_doc_ids)
        conflicts = self._sanitize_conflicts(parsed_data.get("conflicts", []), valid_doc_ids)

        timeframe_raw = parsed_data.get("timeframe")
        timeframe = None
        if isinstance(timeframe_raw, dict):
            timeframe = DecisionTimeframe(
                start=timeframe_raw.get("start"),
                end=timeframe_raw.get("end"),
            )

        # Collect verified source documents
        all_cited_ids: Set[str] = set()
        for r in reasons:
            all_cited_ids.update(r.evidence_ids)
        for a in alternatives:
            all_cited_ids.update(a.evidence_ids)
        for c in conflicts:
            all_cited_ids.update(c.evidence_ids)

        # Step 9: Compute Explainable Confidence Heuristic
        confidence_score, confidence_rationale = self._calculate_confidence(
            memories=evidence_to_use,
            reasons=reasons,
            conflicts=conflicts,
            cited_ids=all_cited_ids,
        )

        return DecisionExplanation(
            question=clean_question,
            decision=decision_text or "Organizational Decision",
            summary=summary_text,
            reasons=reasons,
            alternatives=alternatives,
            constraints=parsed_data.get("constraints", []),
            evidence=evidence_to_use,
            participants=parsed_data.get("participants", []),
            dependencies=parsed_data.get("dependencies", []),
            timeframe=timeframe,
            conflicts=conflicts,
            confidence=confidence_score,
            confidence_rationale=confidence_rationale,
            source_documents=sorted(list(all_cited_ids or valid_doc_ids)),
            prior_investigations=prior_investigations,
            prior_investigations_count=len(prior_investigations),
            # Backward compatibility aliases
            decision_id=parsed_data.get("decision_id") or "dec-reconstructed",
            title=decision_text or "Reconstructed Decision",
            status=DecisionStatusEnum.ACTIVE,
            why_summary=summary_text,
            original_rationale=[r.reason for r in reasons],
        )

    def _format_evidence_package(
        self,
        memories: List[EvidenceItem],
        prior_investigations: Optional[List[PreviousInvestigationItem]] = None,
    ) -> str:
        """Format recalled memories into a clean evidence block, clearly separating primary evidence from prior reasoning."""
        lines: List[str] = []
        lines.append("=== SECTION A: PRIMARY ORGANIZATIONAL EVIDENCE (AUTHORITATIVE) ===")
        for idx, mem in enumerate(memories, start=1):
            doc_id = mem.external_url or f"DOC-{idx}"
            lines.append(f"--- EVIDENCE ITEM #{idx} ---")
            lines.append(f"DOCUMENT ID: {doc_id}")
            lines.append(f"SOURCE TYPE: {mem.source_type}")
            lines.append(f"TITLE/CONTEXT: {mem.title}")
            if mem.author:
                lines.append(f"AUTHOR: {mem.author}")
            if mem.recorded_at:
                lines.append(f"DATE: {mem.recorded_at.isoformat()}")
            lines.append("CONTENT:")
            lines.append(mem.content.strip())
            lines.append("")

        if prior_investigations:
            lines.append("=== SECTION B: PREVIOUS WHY INVESTIGATION MEMORY (PRIOR AI REASONING - CONTEXT ONLY) ===")
            lines.append("NOTE: The following items are from previous WHY investigations. Primary organizational evidence above takes absolute priority.")
            for idx, inv in enumerate(prior_investigations, start=1):
                lines.append(f"--- PRIOR INVESTIGATION #{idx} ---")
                lines.append(f"INVESTIGATION DATE: {inv.investigation_date or 'Prior'}")
                lines.append(f"DECISION RECONSTRUCTED: {inv.decision}")
                lines.append(f"PRIOR STATUS: {inv.status}")
                lines.append(f"CONFIDENCE: {inv.confidence:.2f}")
                if inv.key_reasoning:
                    lines.append(f"KEY REASONING: {'; '.join(inv.key_reasoning)}")
                if inv.changed_assumptions:
                    lines.append(f"CHANGED ASSUMPTIONS IDENTIFIED: {'; '.join(inv.changed_assumptions)}")
                if inv.evidence_ids:
                    lines.append(f"EVIDENCE CITED IN PRIOR RUN: {', '.join(inv.evidence_ids)}")
                lines.append("")

        return "\n".join(lines)

    def _build_reconstruction_prompt(self, question: str, evidence_package: str) -> str:
        """Construct prompt enforcing structured JSON output conforming to DecisionExplanation."""
        return f"""USER QUESTION:
"{question}"

HISTORICAL EVIDENCE RETRIEVED FROM HINDSIGHT:
{evidence_package}

TASK:
Reconstruct the historical decision that answers the user question using ONLY the evidence items above.

EPISTEMIC RULES:
- Section A contains PRIMARY ORGANIZATIONAL EVIDENCE (ADRs, Jira, Slack, PRs, incident logs). This is the ONLY source for document citations.
- Section B contains PREVIOUS WHY INVESTIGATION MEMORY (Prior AI reasoning). It provides contextual continuity, but if Section A contradicts Section B, SECTION A ALWAYS WINS. Do NOT cite Section B as a document ID.

You must respond with a JSON object strictly following this structure:
{{
  "decision": "<Concise 1-sentence statement of the decision made>",
  "summary": "<Comprehensive summary explaining why the decision was made based on the evidence>",
  "reasons": [
    {{
      "reason": "<Specific factual reason or justification>",
      "evidence_ids": ["<DOCUMENT ID from Section A supporting this, e.g. ADR-014>"]
    }}
  ],
  "alternatives": [
    {{
      "name": "<Name of alternative option considered>",
      "reason_not_selected": "<Specific reason why it was rejected>",
      "evidence_ids": ["<DOCUMENT ID from Section A>"]
    }}
  ],
  "constraints": ["<Technical or operational constraints mentioned in evidence>"],
  "participants": ["<Names or usernames of key participants mentioned>"],
  "dependencies": ["<Technical systems, services, or adapters involved>"],
  "timeframe": {{
    "start": "<Start date / time period if mentioned, or null>",
    "end": "<Sunset / deadline date if mentioned, or null>"
  }},
  "conflicts": [
    {{
      "topic": "<Inconsistency topic>",
      "statements": ["<Statement A from Evidence X>", "<Contradicting statement B from Evidence Y>"],
      "evidence_ids": ["<DOCUMENT ID 1>", "<DOCUMENT ID 2>"]
    }}
  ]
}}

CRITICAL INSTRUCTIONS:
- Use ONLY document IDs that appear in the evidence package under 'DOCUMENT ID' (e.g. ADR-014, PAY-1042, SLACK-001).
- Do NOT fabricate document IDs.
- If evidence is insufficient to answer the question, set 'decision': 'Unknown / Insufficient Evidence' and 'summary': 'Insufficient historical evidence to reconstruct this decision.'
"""

    def _parse_llm_json(self, raw_output: str) -> Dict[str, Any]:
        """Parse raw LLM string into JSON dict, safely handling code block wrappers."""
        text = raw_output.strip()
        # Remove markdown code fences if LLM included them
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse LLM response as JSON: %s\nRaw output: %s", exc, raw_output)
            # Attempt regex extraction of first JSON object
            match = re.search(r"(\{.*\})", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
            raise ValueError(f"LLM returned invalid JSON for decision reconstruction: {exc}")

    def _extract_valid_document_ids(self, memories: List[EvidenceItem]) -> Set[str]:
        """Extract all known document IDs from recalled memories."""
        valid_ids: Set[str] = set()
        for mem in memories:
            if mem.external_url:
                valid_ids.add(mem.external_url)
                # Also check common patterns like ADR-014, PAY-1042 in external_url
                for token in re.findall(r"\b[A-Z]{2,}-\d+\b", mem.external_url):
                    valid_ids.add(token)
            if mem.title:
                for token in re.findall(r"\b[A-Z]{2,}-\d+\b", mem.title):
                    valid_ids.add(token)
            if mem.content:
                for token in re.findall(r"\b[A-Z]{2,}-\d+\b", mem.content):
                    valid_ids.add(token)
        return valid_ids

    def _sanitize_reasons(
        self,
        raw_reasons: List[Any],
        valid_doc_ids: Set[str],
    ) -> List[DecisionReason]:
        """Ensure reasons have valid schema and filter out hallucinated document citations."""
        sanitized: List[DecisionReason] = []
        for item in raw_reasons:
            if isinstance(item, dict):
                reason_str = str(item.get("reason", "")).strip()
                if not reason_str:
                    continue
                raw_ids = item.get("evidence_ids", [])
                safe_ids = [doc_id for doc_id in raw_ids if doc_id in valid_doc_ids]
                sanitized.append(DecisionReason(reason=reason_str, evidence_ids=safe_ids))
            elif isinstance(item, str) and item.strip():
                sanitized.append(DecisionReason(reason=item.strip(), evidence_ids=[]))
        return sanitized

    def _sanitize_alternatives(
        self,
        raw_alternatives: List[Any],
        valid_doc_ids: Set[str],
    ) -> List[DecisionAlternative]:
        """Ensure alternatives have valid schema and verified citations."""
        sanitized: List[DecisionAlternative] = []
        for item in raw_alternatives:
            if isinstance(item, dict):
                name = str(item.get("name", "")).strip()
                reason = str(item.get("reason_not_selected", "")).strip()
                if name and reason:
                    raw_ids = item.get("evidence_ids", [])
                    safe_ids = [doc_id for doc_id in raw_ids if doc_id in valid_doc_ids]
                    sanitized.append(
                        DecisionAlternative(
                            name=name,
                            reason_not_selected=reason,
                            evidence_ids=safe_ids,
                        )
                    )
        return sanitized

    def _sanitize_conflicts(
        self,
        raw_conflicts: List[Any],
        valid_doc_ids: Set[str],
    ) -> List[DecisionConflict]:
        """Ensure conflicts have valid schema and verified citations."""
        sanitized: List[DecisionConflict] = []
        for item in raw_conflicts:
            if isinstance(item, dict):
                topic = str(item.get("topic", "")).strip()
                statements = [str(s).strip() for s in item.get("statements", []) if str(s).strip()]
                raw_ids = item.get("evidence_ids", [])
                safe_ids = [doc_id for doc_id in raw_ids if doc_id in valid_doc_ids]
                if topic and statements:
                    sanitized.append(
                        DecisionConflict(
                            topic=topic,
                            statements=statements,
                            evidence_ids=safe_ids,
                        )
                    )
        return sanitized

    def _calculate_confidence(
        self,
        memories: List[EvidenceItem],
        reasons: List[DecisionReason],
        conflicts: List[DecisionConflict],
        cited_ids: Set[str],
    ) -> tuple[float, str]:
        """Compute an explainable evidence-confidence heuristic based on memory quality.

        Score guidelines:
        - 0.90+ : strong multi-source consistent evidence with verified citations
        - 0.70-0.89 : reasonable evidence with some inference
        - 0.50-0.69 : partial evidence
        - <0.50 : weak or uncertain reconstruction
        """
        if not memories or not reasons:
            return 0.0, "No supporting memories or rationale identified."

        # Factor 1: Source Diversity (max +0.40)
        source_types = {m.source_type for m in memories if m.source_type}
        if len(source_types) >= 3:
            diversity_score = 0.40
        elif len(source_types) == 2:
            diversity_score = 0.30
        else:
            diversity_score = 0.15

        # Factor 2: Rationale Evidence Backing (max +0.35)
        reasons_with_citations = sum(1 for r in reasons if len(r.evidence_ids) > 0)
        backing_ratio = reasons_with_citations / len(reasons) if reasons else 0.0
        rationale_score = backing_ratio * 0.35

        # Factor 3: Document Citation Volume (max +0.15)
        if len(cited_ids) >= 3:
            doc_score = 0.15
        elif len(cited_ids) >= 1:
            doc_score = 0.10
        else:
            doc_score = 0.0

        # Factor 4: Consistency / Conflict Penalty (deduction)
        conflict_penalty = len(conflicts) * 0.15

        raw_score = diversity_score + rationale_score + doc_score - conflict_penalty
        final_score = max(0.10, min(0.95, round(raw_score, 2)))

        # Build transparent rationale text
        notes: List[str] = [
            f"Source diversity: {len(source_types)} types ({', '.join(sorted(source_types))})",
            f"Evidence backing: {reasons_with_citations}/{len(reasons)} rationale points cited",
            f"Verified documents: {len(cited_ids)} cited",
        ]
        if conflicts:
            notes.append(f"Penalty: {len(conflicts)} conflict(s) detected")

        rationale = f"Heuristic score based on {'; '.join(notes)}."
        return final_score, rationale

    def _build_insufficient_evidence_response(
        self,
        question: str,
        evidence: Optional[List[EvidenceItem]] = None,
    ) -> DecisionExplanation:
        """Construct standard response for questions with insufficient historical evidence."""
        return DecisionExplanation(
            question=question,
            decision="Unknown / Insufficient Evidence",
            summary="Insufficient historical evidence to reconstruct this decision.",
            reasons=[],
            alternatives=[],
            constraints=[],
            evidence=evidence or [],
            participants=[],
            dependencies=[],
            timeframe=None,
            conflicts=[],
            confidence=0.0,
            confidence_rationale="Insufficient historical records in Hindsight to support a reliable decision reconstruction.",
            source_documents=[],
            decision_id="dec-insufficient-evidence",
            title="Unknown Decision",
            status=DecisionStatusEnum.UNKNOWN,
            why_summary="Insufficient historical evidence to reconstruct this decision.",
            original_rationale=[],
        )
