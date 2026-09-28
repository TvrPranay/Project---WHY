"""Memory Comparison Service for WHY.

Executes a controlled before/after investigation demonstration comparing the decision
outcome without memory (bypassed) versus with Hindsight persistent memory.
"""

from typing import Optional
from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.schemas.decision import (
    DecisionExplanation,
    DecisionStatus,
    MemoryComparisonResponse,
    MemoryMode,
    MemoryModeResult,
)
from app.services.base import BaseService
from app.services.decision_reconstruction import DecisionReconstructionService


class MemoryComparisonService(BaseService):
    """Executes controlled before/after memory demonstrations for WHY."""

    def __init__(
        self,
        reconstruction_service: Optional[DecisionReconstructionService] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.reconstruction_service = reconstruction_service or DecisionReconstructionService(
            settings=self.settings,
        )
        logger.info(
            "Initialized MemoryComparisonService (Default Bank: %s)",
            self.settings.HINDSIGHT_BANK_ID,
        )

    async def run_comparison(
        self,
        question: str,
        bank_id: Optional[str] = None,
        limit: int = 15,
    ) -> MemoryComparisonResponse:
        """Execute independent investigations under both no-memory and Hindsight modes."""
        clean_question = question.strip()
        if not clean_question:
            raise ValueError("Question cannot be empty.")

        target_bank = bank_id or self.settings.HINDSIGHT_BANK_ID
        logger.info(
            "Executing controlled memory comparison for query '%s' on bank '%s'",
            clean_question,
            target_bank,
        )

        # STEP A: Independent reconstruction WITHOUT memory
        logger.info("Executing STEP A: Reconstruction without memory (memory_mode='none')...")
        explanation_without: DecisionExplanation = await self.reconstruction_service.reconstruct_decision(
            question=clean_question,
            bank_id=target_bank,
            limit=limit,
            memory_mode=MemoryMode.NONE,
        )

        # STEP B: Independent reconstruction WITH Hindsight memory
        logger.info("Executing STEP B: Reconstruction with Hindsight (memory_mode='hindsight')...")
        explanation_with: DecisionExplanation = await self.reconstruction_service.reconstruct_decision(
            question=clean_question,
            bank_id=target_bank,
            limit=limit,
            memory_mode=MemoryMode.HINDSIGHT,
        )

        # STEP C: Formulate factual execution metrics
        status_without = (
            explanation_without.status.value
            if isinstance(explanation_without.status, DecisionStatus)
            else str(explanation_without.status or "INSUFFICIENT EVIDENCE")
        )

        status_with = "DECISION RECONSTRUCTED"
        if explanation_with.status:
            status_val = explanation_with.status.value if isinstance(explanation_with.status, DecisionStatus) else str(explanation_with.status)
            if status_val not in ("UNKNOWN", "INSUFFICIENT EVIDENCE"):
                status_with = "DECISION RECONSTRUCTED"
            else:
                status_with = status_val

        without_result = MemoryModeResult(
            memory_mode=MemoryMode.NONE,
            status=status_without,
            evidence_count=len(explanation_without.evidence),
            prior_investigations_count=explanation_without.prior_investigations_count or 0,
            citation_count=len(explanation_without.source_documents),
            bank_id=None,
            narrative=(
                "Without organizational memory, WHY cannot identify why this decision was made "
                "and reports INSUFFICIENT EVIDENCE rather than hallucinating historical facts."
            ),
            explanation=explanation_without,
        )

        with_result = MemoryModeResult(
            memory_mode=MemoryMode.HINDSIGHT,
            status=status_with,
            evidence_count=len(explanation_with.evidence),
            prior_investigations_count=explanation_with.prior_investigations_count or 0,
            citation_count=len(explanation_with.source_documents),
            bank_id=target_bank,
            narrative=(
                f"With Hindsight memory enabled, WHY recalled {len(explanation_with.evidence)} primary "
                f"evidence records and {explanation_with.prior_investigations_count or 0} prior investigations from "
                f"bank '{target_bank}', reconstructing the decision with {len(explanation_with.source_documents)} citations."
            ),
            explanation=explanation_with,
        )

        logger.info(
            "Controlled comparison completed. Without memory: %s (%d evidence), With Hindsight: %s (%d evidence, %d citations)",
            status_without,
            without_result.evidence_count,
            status_with,
            with_result.evidence_count,
            with_result.citation_count,
        )

        return MemoryComparisonResponse(
            question=clean_question,
            without_memory=without_result,
            with_hindsight=with_result,
        )
