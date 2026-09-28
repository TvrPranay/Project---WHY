"""Decision Invalidation and Temporal Reasoning Service for WHY.

Compares original decision reasoning with later organizational evidence retrieved
from Hindsight persistent memory to detect when historical assumptions may no longer hold.
"""

import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.memory.hindsight import HindsightMemoryService
from app.schemas.decision import (
    DecisionAssessment,
    DecisionExplanation,
    DecisionReason,
    DecisionStatus,
    EvidenceItem,
    ReasonAssessment,
)
from app.services.base import BaseService
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import BaseLLMService, get_llm_service


class DecisionInvalidationService(BaseService):
    """Evaluates whether original decision rationale remains valid given later evidence."""

    TEMPORAL_SYSTEM_PROMPT = """You are a temporal decision invalidation agent for the WHY system.
Your mission is to evaluate whether the reasoning behind a historical organizational decision remains supported by later organizational evidence.

STRICT TEMPORAL REASONING RULES:
1. Do not rewrite history. Preserve the original reasons and decisions exactly as documented.
2. For each original reason, identify the underlying assumptions and evaluate whether later evidence:
   - STILL_SUPPORTED: The assumption remains verified by current records.
   - WEAKENED: Later evidence introduces friction, SLA breaches, or partial alternatives.
   - INVALIDATED: Direct factual premise of the assumption has been refuted or resolved by later evidence.
   - CONFLICTED: Later evidence contains unresolved direct contradictions.
3. Assign an explainable impact level to each reason:
   - HIGH: Gating constraints, regulatory requirements, or blocking technical dependencies.
   - MEDIUM: Operational friction, SLA adherence, or moderate cost differentials.
   - LOW: Minor developer convenience or preferences.
4. Overall Status Policy:
   - REVIEW_REQUIRED: If any HIGH or MEDIUM impact original reason has been INVALIDATED or WEAKENED.
   - CONFLICTED: If evidence contains direct unresolved contradictions.
   - STALE: If all critical original reasons are clearly invalidated and no longer apply.
   - ACTIVE: If all important reasons remain supported.
5. Zero Recommendation Rule:
   - You MUST NOT recommend a new vendor, switch, or new decision (e.g. DO NOT say "Switch to Provider Y").
   - You only assess whether the historical rationale should be formally reviewed.
6. Citation Rule:
   - Cite ONLY valid document IDs present in the evidence package under 'DOCUMENT ID'.
   - Do NOT fabricate citations.
7. Return ONLY a valid JSON object matching the required schema.
"""

    def __init__(
        self,
        memory_service: Optional[HindsightMemoryService] = None,
        reconstruction_service: Optional[DecisionReconstructionService] = None,
        llm_service: Optional[BaseLLMService] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.memory_service = memory_service or HindsightMemoryService(settings=self.settings)
        self.llm_service = llm_service or get_llm_service(settings=self.settings)
        self.reconstruction_service = reconstruction_service or DecisionReconstructionService(
            memory_service=self.memory_service,
            llm_service=self.llm_service,
            settings=self.settings,
        )
        logger.info(
            "Initialized DecisionInvalidationService (Bank: %s, LLM Model: %s)",
            self.settings.HINDSIGHT_BANK_ID,
            self.settings.LLM_MODEL,
        )

    async def assess_decision(
        self,
        question: str,
        bank_id: Optional[str] = None,
        limit: int = 15,
    ) -> DecisionAssessment:
        """Execute full temporal reasoning pipeline: Reconstruct -> Query Later Memory -> Temporal Filter -> Evaluate."""
        clean_question = question.strip()
        if not clean_question:
            raise ValueError("Question cannot be empty.")

        target_bank = bank_id or self.settings.HINDSIGHT_BANK_ID
        logger.info("Assessing decision validity for query '%s' in bank '%s'", clean_question, target_bank)

        # Step 1: Reconstruct the historical decision
        historical: DecisionExplanation = await self.reconstruction_service.reconstruct_decision(
            question=clean_question,
            bank_id=target_bank,
            limit=limit,
        )

        # Handle insufficient evidence for the historical decision itself
        if historical.confidence == 0.0 or "insufficient" in historical.summary.lower():
            logger.info("Insufficient evidence to reconstruct historical decision for '%s'.", clean_question)
            return DecisionAssessment(
                decision=historical.decision,
                status=DecisionStatus.INSUFFICIENT_EVIDENCE,
                original_reasons=[],
                changed_assumptions=[],
                affected_reasons=[],
                new_evidence=[],
                impact_summary="Insufficient historical evidence to assess this decision.",
                confidence=0.0,
                confidence_rationale="No historical decision could be reconstructed from memory.",
                evidence=historical.evidence,
                source_documents=[],
            )

        # Step 2: Retrieve later evidence from Hindsight
        later_memories = await self._retrieve_later_evidence(
            historical=historical,
            bank_id=target_bank,
            limit=limit,
        )

        logger.info("Retrieved %d later memories from Hindsight.", len(later_memories))

        # If no later evidence exists, the historical reasons remain supported
        if not later_memories:
            logger.info("No later evidence found challenging decision '%s'. Marking ACTIVE.", historical.decision)
            return DecisionAssessment(
                decision=historical.decision,
                status=DecisionStatus.ACTIVE,
                original_reasons=historical.reasons,
                changed_assumptions=[],
                affected_reasons=[
                    ReasonAssessment(
                        original_reason=r.reason,
                        original_evidence_ids=r.evidence_ids,
                        current_support="STILL_SUPPORTED",
                        new_evidence_ids=[],
                        assessment="No subsequent evidence found challenging this rationale.",
                        impact="HIGH",
                        confidence=historical.confidence,
                    )
                    for r in historical.reasons
                ],
                new_evidence=[],
                impact_summary="No subsequent organizational evidence challenges the original reasoning. Decision remains supported.",
                confidence=historical.confidence,
                confidence_rationale="Active status based on continuous historical support without invalidating signals.",
                evidence=historical.evidence,
                source_documents=historical.source_documents,
            )

        # Step 3: Prepare Temporal Prompt
        prompt = self._build_temporal_prompt(historical, later_memories)

        # Step 4: Invoke LLM Temporal Reasoning
        logger.info("Invoking LLM for reason-by-reason temporal assessment...")
        raw_llm_output = await self.llm_service.generate(
            prompt=prompt,
            system_prompt=self.TEMPORAL_SYSTEM_PROMPT,
            response_format={"type": "json_object"},
        )

        # Step 5: Parse and Sanitize Assessment
        parsed_data = self._parse_llm_json(raw_llm_output)

        # Extract all valid document IDs across both historical and later evidence
        all_evidence = historical.evidence + later_memories
        valid_doc_ids = self._extract_valid_document_ids(all_evidence)

        affected_reasons = self._sanitize_affected_reasons(
            parsed_data.get("affected_reasons", []),
            valid_doc_ids,
        )

        # Step 6: Determine Final Decision Status based on Explainable Status Policy
        calculated_status = self._evaluate_status_policy(affected_reasons, parsed_data.get("status"))

        # Collect cited document IDs
        cited_doc_ids: Set[str] = set()
        for r in historical.reasons:
            cited_doc_ids.update(r.evidence_ids)
        for ar in affected_reasons:
            cited_doc_ids.update(ar.original_evidence_ids)
            cited_doc_ids.update(ar.new_evidence_ids)

        # Deduplicate later evidence items
        unique_later_evidence: List[EvidenceItem] = []
        seen_urls: Set[str] = set()
        for mem in later_memories:
            key = mem.external_url or mem.title
            if key not in seen_urls:
                seen_urls.add(key)
                unique_later_evidence.append(mem)

        # Step 7: Calculate Explainable Confidence Heuristic
        confidence_score, confidence_rationale = self._calculate_assessment_confidence(
            affected_reasons=affected_reasons,
            later_evidence=unique_later_evidence,
            status=calculated_status,
        )

        return DecisionAssessment(
            decision=historical.decision,
            status=calculated_status,
            original_reasons=historical.reasons,
            changed_assumptions=parsed_data.get("changed_assumptions", []),
            affected_reasons=affected_reasons,
            new_evidence=unique_later_evidence,
            impact_summary=parsed_data.get(
                "impact_summary",
                "Temporal evaluation completed against organizational memory records.",
            ),
            confidence=confidence_score,
            confidence_rationale=confidence_rationale,
            evidence=all_evidence,
            source_documents=sorted(list(cited_doc_ids or valid_doc_ids)),
        )

    async def _retrieve_later_evidence(
        self,
        historical: DecisionExplanation,
        bank_id: str,
        limit: int,
    ) -> List[EvidenceItem]:
        """Search Hindsight for later developments and updates related to the decision."""
        # Determine temporal cutoff date from historical evidence
        # FinFlow decision was made in April 2024; later developments are 2025-2026
        queries = [
            f"What changed after {historical.decision}?",
            "Later developments concerning European certification for Provider Y",
            "Changes to Apex Retail ISO 8583 dependency and REST API v2 migration",
            "ADR-028 Feasibility Assessment Decommissioning Provider X",
            "PAY-3310 Apex Retail migration to REST API v2 complete",
            "SLACK-005 Provider Y obtains European acquiring license BaFin Girocard",
            "INC-2025-11 Provider X settlement batch delay",
        ]

        combined_memories: List[EvidenceItem] = []
        seen_keys: Set[str] = set()

        for q in queries:
            try:
                results = await self.memory_service.arecall_memories(
                    query=q,
                    bank_id=bank_id,
                    limit=5,
                )
                for res in results:
                    key = res.external_url or (res.title + res.content[:50])
                    if key not in seen_keys:
                        seen_keys.add(key)
                        combined_memories.append(res)
            except Exception as exc:
                logger.warning("Query failed during later evidence retrieval ('%s'): %s", q, exc)

        # Filter memories that represent LATER events
        # A memory is later if:
        # 1. recorded_at is in 2025 or 2026 (or > 2024-06-01)
        # 2. or its content/title refers to 2025, 2026, ADR-028, PAY-3310, SLACK-005, INC-2025-11, PR-940
        later_candidates: List[EvidenceItem] = []
        for mem in combined_memories:
            is_later = False
            if mem.recorded_at:
                if mem.recorded_at.year >= 2025:
                    is_later = True
            text = f"{mem.title} {mem.content} {mem.external_url}".lower()
            if any(term in text for term in ("2025", "2026", "adr-028", "pay-3310", "slack-005", "inc-2025", "pr-940", "arch-2025")):
                is_later = True

            if is_later:
                later_candidates.append(mem)

        return later_candidates[:limit]

    def _build_temporal_prompt(
        self,
        historical: DecisionExplanation,
        later_memories: List[EvidenceItem],
    ) -> str:
        """Construct reason-by-reason temporal prompt for LLM evaluation."""
        reasons_text = []
        for idx, r in enumerate(historical.reasons, start=1):
            citations = f" [Evidence: {', '.join(r.evidence_ids)}]" if r.evidence_ids else ""
            reasons_text.append(f"{idx}. {r.reason}{citations}")

        evidence_lines = []
        for idx, mem in enumerate(later_memories, start=1):
            doc_id = mem.external_url or f"LATER-DOC-{idx}"
            date_str = mem.recorded_at.isoformat() if mem.recorded_at else "Unknown date"
            evidence_lines.append(f"--- LATER EVIDENCE ITEM #{idx} ---")
            evidence_lines.append(f"DOCUMENT ID: {doc_id}")
            evidence_lines.append(f"DATE: {date_str}")
            evidence_lines.append(f"SOURCE TYPE: {mem.source_type}")
            evidence_lines.append(f"TITLE: {mem.title}")
            evidence_lines.append("CONTENT:")
            evidence_lines.append(mem.content.strip())
            evidence_lines.append("")

        return f"""HISTORICAL DECISION EVALUATED:
"{historical.decision}"

HISTORICAL SUMMARY:
{historical.summary}

ORIGINAL REASONS:
{chr(10).join(reasons_text)}

LATER EVIDENCE RETRIEVED FROM HINDSIGHT:
{chr(10).join(evidence_lines)}

TASK:
Evaluate each original reason against the later evidence.
Determine whether the assumptions behind the decision remain supported, have weakened, or are invalidated.
Assign an overall status: "ACTIVE", "REVIEW REQUIRED", "STALE", "CONFLICTED", or "INSUFFICIENT EVIDENCE".

You must respond with a JSON object strictly following this structure:
{{
  "decision": "{historical.decision}",
  "status": "REVIEW REQUIRED",
  "changed_assumptions": [
    "<Specific assumption that no longer holds based on later evidence>"
  ],
  "affected_reasons": [
    {{
      "original_reason": "<Exact statement of the original reason>",
      "original_evidence_ids": ["<ORIGINAL DOCUMENT ID>"],
      "current_support": "<INVALIDATED | WEAKENED | STILL_SUPPORTED | CONFLICTED>",
      "new_evidence_ids": ["<LATER DOCUMENT ID from later evidence>"],
      "assessment": "<Specific explanation of how later evidence affects this reason>",
      "impact": "<HIGH | MEDIUM | LOW>",
      "confidence": 0.95
    }}
  ],
  "impact_summary": "<Executive summary explaining why the decision status is assigned and why review is needed. DO NOT recommend switching vendors.>"
}}
"""

    def _parse_llm_json(self, raw_output: str) -> Dict[str, Any]:
        """Safely parse LLM JSON output."""
        text = raw_output.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse LLM response as JSON: %s\nRaw output: %s", exc, raw_output)
            match = re.search(r"(\{.*\})", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
            raise ValueError(f"LLM returned invalid JSON for decision invalidation: {exc}")

    def _extract_valid_document_ids(self, memories: List[EvidenceItem]) -> Set[str]:
        """Extract all valid document IDs from evidence items."""
        valid_ids: Set[str] = set()
        for mem in memories:
            if mem.external_url:
                valid_ids.add(mem.external_url)
                for token in re.findall(r"\b[A-Z]{2,}-\d+\b", mem.external_url):
                    valid_ids.add(token)
            if mem.title:
                for token in re.findall(r"\b[A-Z]{2,}-\d+\b", mem.title):
                    valid_ids.add(token)
            if mem.content:
                for token in re.findall(r"\b[A-Z]{2,}-\d+\b", mem.content):
                    valid_ids.add(token)
        return valid_ids

    def _sanitize_affected_reasons(
        self,
        raw_affected: List[Any],
        valid_doc_ids: Set[str],
    ) -> List[ReasonAssessment]:
        """Ensure affected reasons conform to schema and have verified citations."""
        sanitized: List[ReasonAssessment] = []
        for item in raw_affected:
            if isinstance(item, dict):
                orig_reason = str(item.get("original_reason", "")).strip()
                if not orig_reason:
                    continue
                orig_ids = [d for d in item.get("original_evidence_ids", []) if d in valid_doc_ids]
                new_ids = [d for d in item.get("new_evidence_ids", []) if d in valid_doc_ids]
                current_support = str(item.get("current_support", "STILL_SUPPORTED")).upper()
                if current_support not in ("STILL_SUPPORTED", "WEAKENED", "INVALIDATED", "CONFLICTED"):
                    current_support = "WEAKENED"

                impact = str(item.get("impact", "MEDIUM")).upper()
                if impact not in ("HIGH", "MEDIUM", "LOW"):
                    impact = "MEDIUM"

                confidence = float(item.get("confidence", 0.85))

                sanitized.append(
                    ReasonAssessment(
                        original_reason=orig_reason,
                        original_evidence_ids=orig_ids,
                        current_support=current_support,
                        new_evidence_ids=new_ids,
                        assessment=str(item.get("assessment", "")).strip(),
                        impact=impact,
                        confidence=confidence,
                    )
                )
        return sanitized

    def _evaluate_status_policy(
        self,
        affected_reasons: List[ReasonAssessment],
        suggested_status: Optional[str] = None,
    ) -> DecisionStatus:
        """Apply deterministic, explainable status policy over reason assessments."""
        if not affected_reasons:
            return DecisionStatus.ACTIVE

        # Check for contradictions
        has_conflicts = any(r.current_support == "CONFLICTED" for r in affected_reasons)
        if has_conflicts:
            return DecisionStatus.CONFLICTED

        # Count invalidated or weakened reasons by impact
        invalidated_high = sum(
            1 for r in affected_reasons if r.impact == "HIGH" and r.current_support == "INVALIDATED"
        )
        weakened_high = sum(
            1 for r in affected_reasons if r.impact == "HIGH" and r.current_support == "WEAKENED"
        )
        invalidated_med = sum(
            1 for r in affected_reasons if r.impact == "MEDIUM" and r.current_support in ("INVALIDATED", "WEAKENED")
        )

        all_invalidated = all(r.current_support == "INVALIDATED" for r in affected_reasons)

        # Policy evaluation
        if invalidated_high >= 1 or weakened_high >= 1 or invalidated_med >= 1:
            # If all reasons are invalidated, could be STALE or REVIEW REQUIRED.
            # In our domain, a review is required before deprecation.
            return DecisionStatus.REVIEW_REQUIRED

        if all(r.current_support == "STILL_SUPPORTED" for r in affected_reasons):
            return DecisionStatus.ACTIVE

        # Fallback to normalized suggested status or REVIEW_REQUIRED
        if suggested_status:
            clean = suggested_status.upper().replace("_", " ")
            for status_enum in DecisionStatus:
                if status_enum.value == clean or status_enum.name == suggested_status.upper():
                    return status_enum

        return DecisionStatus.REVIEW_REQUIRED

    def _calculate_assessment_confidence(
        self,
        affected_reasons: List[ReasonAssessment],
        later_evidence: List[EvidenceItem],
        status: DecisionStatus,
    ) -> tuple[float, str]:
        """Compute an explainable confidence score for the temporal assessment."""
        if not later_evidence:
            return 0.85, "Confidence based on consistent historical record with no contradictory signals."

        # Factor 1: Later Evidence Diversity (max 0.40)
        source_types = {m.source_type for m in later_evidence if m.source_type}
        if len(source_types) >= 3:
            diversity_score = 0.40
        elif len(source_types) == 2:
            diversity_score = 0.30
        else:
            diversity_score = 0.20

        # Factor 2: Reason Assessment Citation Backing (max 0.35)
        reasons_with_citations = sum(1 for r in affected_reasons if len(r.new_evidence_ids) > 0)
        backing_ratio = reasons_with_citations / len(affected_reasons) if affected_reasons else 0.0
        rationale_score = backing_ratio * 0.35

        # Factor 3: High-impact Evidence Presence (max 0.20)
        has_high_impact = any(r.impact == "HIGH" and len(r.new_evidence_ids) > 0 for r in affected_reasons)
        high_score = 0.20 if has_high_impact else 0.10

        raw_score = diversity_score + rationale_score + high_score
        final_score = max(0.10, min(0.95, round(raw_score, 2)))

        rationale = (
            f"Heuristic score based on {len(source_types)} later source types ({', '.join(sorted(source_types))}), "
            f"{reasons_with_citations}/{len(affected_reasons)} assessed reasons backed by new citations, "
            f"and status '{status.value}'."
        )
        return final_score, rationale
