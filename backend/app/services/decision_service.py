"""Decision Service Interface (Placeholder for Phase 1).

Coordinates historical memory retrieval from Hindsight with LLM reasoning
to answer WHY, WHAT CHANGED, and WHAT COULD BREAK.
"""

from typing import Optional
from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.memory.hindsight import HindsightMemoryService
from app.schemas.decision import DecisionExplanation, DecisionStatusEnum
from app.services.base import BaseService
from app.services.llm_service import BaseLLMService, get_llm_service


class DecisionService(BaseService):
    """Coordinates memory recall and reasoning for architectural decisions."""

    def __init__(
        self,
        memory_service: Optional[HindsightMemoryService] = None,
        llm_service: Optional[BaseLLMService] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.memory_service = memory_service or HindsightMemoryService(self.settings)
        self.llm_service = llm_service or get_llm_service(self.settings)
        logger.info("Initialized DecisionService placeholder.")

    async def investigate_decision(
        self,
        query: str,
        decision_id: Optional[str] = None,
    ) -> DecisionExplanation:
        """Investigate why a decision was made and whether it remains valid.

        Phase 1 placeholder: Establishes contract and returns structural schema.
        Genuine Hindsight recall and LLM reasoning will be connected in future phases.
        """
        logger.info(
            "DecisionService.investigate_decision called (placeholder) for query: '%s'",
            query,
        )

        return DecisionExplanation(
            decision_id=decision_id or "dec-finflow-legacy-gateway",
            title="Retention of Legacy Payment Gateway",
            status=DecisionStatusEnum.ACTIVE,
            why_summary=(
                "[Placeholder] System will query Hindsight organizational memory to reconstruct "
                "why FinFlow maintained the Legacy Payment Gateway."
            ),
            original_rationale=[
                "[Placeholder] Historical rationale will be extracted from synthetic Slack/Jira/PR/ADR records.",
            ],
            what_changed=None,
            invalidation_triggers=[],
            what_could_break=[
                "[Placeholder] Dependencies and merchant impacts will be analyzed.",
            ],
            evidence=[],
        )
