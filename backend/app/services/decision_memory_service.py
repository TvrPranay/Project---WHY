"""Decision Memory Service for WHY.

Retains and recalls completed decision investigations in Hindsight persistent memory,
allowing WHY to build and evolve organizational decision reasoning over time.
"""

from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Optional

from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.memory.hindsight import HindsightMemoryService
from app.schemas.decision import (
    DecisionHistoryResponse,
    DecisionReason,
    DecisionStatus,
    EvidenceItem,
    PreviousInvestigationItem,
    RememberDecisionRequest,
    RememberDecisionResponse,
)
from app.services.base import BaseService


class DecisionMemoryService(BaseService):
    """Manages the retention, semantic recall, and evolution of decision investigation memories in Hindsight."""

    def __init__(
        self,
        memory_service: Optional[HindsightMemoryService] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.memory_service = memory_service or HindsightMemoryService(settings=self.settings)
        logger.info(
            "Initialized DecisionMemoryService (Bank: %s)",
            self.settings.HINDSIGHT_BANK_ID,
        )

    def serialize_investigation_memory(self, request: RememberDecisionRequest) -> str:
        """Create a semantic, human-readable natural language memory representation of an investigation.

        Avoids raw JSON dumps to ensure optimal Hindsight semantic embedding and recall.
        """
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        status_val = request.status.value if isinstance(request.status, DecisionStatus) else str(request.status)

        # Build clean bullet points for original reasoning
        reasons_text = ""
        if request.reasons:
            reasons_lines = []
            for idx, r in enumerate(request.reasons, start=1):
                citation_str = f" (Evidence: {', '.join(r.evidence_ids)})" if r.evidence_ids else ""
                reasons_lines.append(f"  {idx}. {r.reason}{citation_str}")
            reasons_text = "\n".join(reasons_lines)
        else:
            reasons_text = "  None documented."

        # Alternatives considered
        alts_text = ", ".join(request.alternatives) if request.alternatives else "None recorded"

        # Evidence IDs
        evidence_text = ", ".join(request.evidence_ids) if request.evidence_ids else "None cited"

        # Changed assumptions
        if request.changed_assumptions:
            changed_lines = [f"  - {ca}" for ca in request.changed_assumptions]
            changed_text = "\n".join(changed_lines)
        else:
            changed_text = "  - No assumptions currently invalidated."

        # Narrative summary paragraph
        narrative_parts = [
            f"WHY investigated the organizational decision: '{request.decision}'.",
            f"The primary question investigated was: '{request.question}'.",
        ]
        if request.reasons:
            narrative_parts.append(
                f"Historical records originally supported this decision with key rationales including {request.reasons[0].reason}."
            )
        if request.alternatives:
            narrative_parts.append(f"Alternatives considered included {alts_text}.")
        if request.changed_assumptions:
            narrative_parts.append(
                f"Later temporal analysis determined that critical assumptions have changed: {'; '.join(request.changed_assumptions)}."
            )
        narrative_parts.append(
            f"The investigation concluded with status {status_val} (confidence score: {request.confidence:.2f})."
        )
        narrative_summary = " ".join(narrative_parts)

        structured_memory = f"""[WHY DECISION INVESTIGATION MEMORY]
Investigation Date: {now_str}
Decision Investigated: {request.decision}
Original Question: {request.question}
Validity Status: {status_val}
Assessment Confidence: {request.confidence:.2f}

EXECUTIVE NARRATIVE:
{narrative_summary}

ORIGINAL DECISION REASONING:
{reasons_text}

ALTERNATIVES CONSIDERED:
{alts_text}

HISTORICAL EVIDENCE CITATIONS:
{evidence_text}

CHANGED ASSUMPTIONS & TEMPORAL INVALIDATION:
{changed_text}

IMPACT SUMMARY:
{request.impact_summary or 'Standard organizational decision assessment.'}

NOTE: This record represents prior AI reasoning from a completed WHY investigation.
In future investigations, primary organizational evidence must always supersede this prior reasoning.
"""
        return structured_memory.strip()

    def _derive_decision_id(self, request: RememberDecisionRequest) -> str:
        """Derive or sanitize a canonical decision identifier."""
        if request.decision_id:
            return request.decision_id.strip()
        # Derive slug from decision text or question
        base_text = request.decision if len(request.decision) > 10 else request.question
        clean_slug = re.sub(r"[^a-zA-Z0-9]+", "-", base_text.lower()).strip("-")
        words = clean_slug.split("-")[:6]
        return f"inv-{'-'.join(words)}"

    async def aretain_investigation(
        self,
        request: RememberDecisionRequest,
    ) -> RememberDecisionResponse:
        """Retain a decision investigation memory asynchronously into Hindsight Cloud."""
        target_bank = request.bank_id or self.settings.HINDSIGHT_BANK_ID
        decision_id = self._derive_decision_id(request)
        status_val = request.status.value if isinstance(request.status, DecisionStatus) else str(request.status)
        now_dt = datetime.now(timezone.utc)
        now_iso = now_dt.isoformat()

        content = self.serialize_investigation_memory(request)
        doc_id = f"WHY-INV-{int(now_dt.timestamp())}-{decision_id[:24]}"

        # SDK-safe string metadata
        metadata = {
            "source_type": "decision_investigation",
            "memory_type": "decision_investigation",
            "decision_id": decision_id,
            "status": status_val,
            "investigation_date": now_iso,
            "confidence": f"{request.confidence:.2f}",
            "source": "WHY",
            "decision": request.decision[:120],
        }

        tags = [
            "why_investigation",
            "decision_investigation",
            f"status_{status_val.lower().replace(' ', '_')}",
            decision_id[:30],
        ]

        logger.info(
            "Retaining decision investigation in Hindsight bank '%s' (doc_id=%s, decision_id=%s)",
            target_bank,
            doc_id,
            decision_id,
        )

        retained_id = await self.memory_service.aretain_memory(
            content=content,
            context=f"Decision Investigation: {request.decision[:80]}",
            document_id=doc_id,
            timestamp=now_dt,
            metadata=metadata,
            tags=tags,
            bank_id=target_bank,
        )

        return RememberDecisionResponse(
            success=True,
            memory_type="decision_investigation",
            decision_id=decision_id,
            message="Decision reasoning retained in Hindsight.",
            document_id=retained_id or doc_id,
            investigation_date=now_iso,
        )

    def retain_investigation(
        self,
        request: RememberDecisionRequest,
    ) -> RememberDecisionResponse:
        """Synchronously retain a decision investigation memory into Hindsight."""
        target_bank = request.bank_id or self.settings.HINDSIGHT_BANK_ID
        decision_id = self._derive_decision_id(request)
        status_val = request.status.value if isinstance(request.status, DecisionStatus) else str(request.status)
        now_dt = datetime.now(timezone.utc)
        now_iso = now_dt.isoformat()

        content = self.serialize_investigation_memory(request)
        doc_id = f"WHY-INV-{int(now_dt.timestamp())}-{decision_id[:24]}"

        metadata = {
            "source_type": "decision_investigation",
            "memory_type": "decision_investigation",
            "decision_id": decision_id,
            "status": status_val,
            "investigation_date": now_iso,
            "confidence": f"{request.confidence:.2f}",
            "source": "WHY",
            "decision": request.decision[:120],
        }

        tags = [
            "why_investigation",
            "decision_investigation",
            f"status_{status_val.lower().replace(' ', '_')}",
            decision_id[:30],
        ]

        retained_id = self.memory_service.retain_memory(
            content=content,
            context=f"Decision Investigation: {request.decision[:80]}",
            document_id=doc_id,
            timestamp=now_dt,
            metadata=metadata,
            tags=tags,
            bank_id=target_bank,
        )

        return RememberDecisionResponse(
            success=True,
            memory_type="decision_investigation",
            decision_id=decision_id,
            message="Decision reasoning retained in Hindsight.",
            document_id=retained_id or doc_id,
            investigation_date=now_iso,
        )

    async def arecall_previous_investigations(
        self,
        question: str,
        bank_id: Optional[str] = None,
        limit: int = 5,
    ) -> List[PreviousInvestigationItem]:
        """Semantically recall previous WHY investigations related to the question from Hindsight."""
        target_bank = bank_id or self.settings.HINDSIGHT_BANK_ID
        search_query = f"Previous WHY decision investigation and reasoning regarding: {question}"

        logger.info(
            "Recalling previous WHY investigations from bank '%s' with query: '%s'",
            target_bank,
            search_query,
        )

        # Recall candidate memories from Hindsight
        candidates: List[EvidenceItem] = await self.memory_service.arecall_memories(
            query=search_query,
            bank_id=target_bank,
            limit=limit * 3,
        )

        # Filter and parse memories that represent prior investigations
        investigations: List[PreviousInvestigationItem] = []
        seen_docs = set()

        for cand in candidates:
            doc_ref = cand.external_url or cand.title
            if doc_ref in seen_docs:
                continue

            parsed = self._parse_investigation_memory(cand)
            if parsed:
                seen_docs.add(doc_ref)
                investigations.append(parsed)
                if len(investigations) >= limit:
                    break

        logger.info(
            "Found %d previous WHY investigation memories for query '%s'",
            len(investigations),
            question,
        )
        return investigations

    def recall_previous_investigations(
        self,
        question: str,
        bank_id: Optional[str] = None,
        limit: int = 5,
    ) -> List[PreviousInvestigationItem]:
        """Synchronously recall previous WHY investigations from Hindsight."""
        target_bank = bank_id or self.settings.HINDSIGHT_BANK_ID
        search_query = f"Previous WHY decision investigation and reasoning regarding: {question}"

        candidates: List[EvidenceItem] = self.memory_service.recall_memories(
            query=search_query,
            bank_id=target_bank,
            limit=limit * 3,
        )

        investigations: List[PreviousInvestigationItem] = []
        seen_docs = set()

        for cand in candidates:
            doc_ref = cand.external_url or cand.title
            if doc_ref in seen_docs:
                continue

            parsed = self._parse_investigation_memory(cand)
            if parsed:
                seen_docs.add(doc_ref)
                investigations.append(parsed)
                if len(investigations) >= limit:
                    break

        return investigations

    def _parse_investigation_memory(self, item: EvidenceItem) -> Optional[PreviousInvestigationItem]:
        """Inspect and parse an EvidenceItem to verify if it represents a previous WHY investigation."""
        content = item.content or ""
        source_type = (item.source_type or "").lower()
        title = (item.title or "").lower()

        is_investigation = (
            source_type == "decision_investigation"
            or "[why decision investigation memory]" in content.lower()
            or "decision investigation:" in title
            or "why investigated the organizational decision" in content.lower()
        )

        if not is_investigation:
            return None

        # Extract structured elements from the semantic text
        decision_match = re.search(r"Decision Investigated:\s*(.+)", content, re.IGNORECASE)
        decision = decision_match.group(1).strip() if decision_match else item.title

        date_match = re.search(r"Investigation Date:\s*(.+)", content, re.IGNORECASE)
        date_str = date_match.group(1).strip() if date_match else (item.recorded_at.isoformat() if item.recorded_at else None)

        status_match = re.search(r"Validity Status:\s*(.+)", content, re.IGNORECASE)
        status_str = status_match.group(1).strip() if status_match else "REVIEW REQUIRED"

        conf_match = re.search(r"Assessment Confidence:\s*([0-9.]+)", content, re.IGNORECASE)
        confidence = float(conf_match.group(1)) if conf_match else (item.confidence_score or 0.90)

        # Extract key reasoning lines
        key_reasons: List[str] = []
        reasons_section = re.search(r"ORIGINAL DECISION REASONING:\n(.*?)(?=\n\n|\n[A-Z\s]+:|$)", content, re.DOTALL)
        if reasons_section:
            for line in reasons_section.group(1).splitlines():
                clean_l = re.sub(r"^\s*\d+\.\s*", "", line).strip()
                if clean_l and not clean_l.startswith("None"):
                    key_reasons.append(clean_l)

        # Extract changed assumptions
        changed_assumptions: List[str] = []
        changed_section = re.search(r"CHANGED ASSUMPTIONS & TEMPORAL INVALIDATION:\n(.*?)(?=\n\n|\n[A-Z\s]+:|$)", content, re.DOTALL)
        if changed_section:
            for line in changed_section.group(1).splitlines():
                clean_ca = re.sub(r"^\s*-\s*", "", line).strip()
                if clean_ca and not clean_ca.startswith("No assumptions"):
                    changed_assumptions.append(clean_ca)

        # Extract document citations
        evidence_ids = re.findall(r"\b[A-Z]{2,}-\d+\b", content)
        # Exclude self-references like WHY-INV
        clean_evidence_ids = sorted(list({eid for eid in evidence_ids if not eid.startswith("WHY-")}))

        # Executive narrative excerpt
        narrative_match = re.search(r"EXECUTIVE NARRATIVE:\n(.*?)(?=\n\n|\n[A-Z\s]+:|$)", content, re.DOTALL)
        summary = narrative_match.group(1).strip() if narrative_match else content[:300]

        return PreviousInvestigationItem(
            investigation_date=date_str,
            decision=decision,
            status=status_str,
            confidence=min(1.0, max(0.0, confidence)),
            key_reasoning=key_reasons or ["Historical decision investigated and validated against requirements."],
            evidence_ids=clean_evidence_ids,
            changed_assumptions=changed_assumptions,
            summary=summary,
            document_id=item.external_url or item.title,
            is_prior_ai_reasoning=True,
        )
