"""Live Integration Test for Decision Invalidation / Temporal Reasoning Engine (Phase 5).

Guarded by HINDSIGHT_INTEGRATION_TEST=true environment variable.
Reconstructs the historical decision against Hindsight Cloud bank 'finflow-why',
queries later evidence, and verifies reason-by-reason invalidation assessment.
"""

import os
import pytest

from app.core.config import get_settings
from app.memory.hindsight import HindsightMemoryService
from app.schemas.decision import DecisionStatus
from app.services.decision_invalidation import DecisionInvalidationService
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import get_llm_service

RUN_INTEGRATION = os.getenv("HINDSIGHT_INTEGRATION_TEST", "").lower() in ("true", "1", "yes")


@pytest.mark.asyncio
@pytest.mark.skipif(
    not RUN_INTEGRATION,
    reason="Live Hindsight integration test skipped. Set HINDSIGHT_INTEGRATION_TEST=true to run.",
)
async def test_live_decision_invalidation_assessment():
    """Verify live decision assessment against Hindsight Cloud and configured LLM."""
    settings = get_settings()

    memory_service = HindsightMemoryService(settings=settings)
    llm_service = get_llm_service(settings=settings)
    reconstruction_service = DecisionReconstructionService(
        memory_service=memory_service,
        llm_service=llm_service,
        settings=settings,
    )
    invalidation_service = DecisionInvalidationService(
        memory_service=memory_service,
        reconstruction_service=reconstruction_service,
        llm_service=llm_service,
        settings=settings,
    )

    # 1. Ask question
    question = "Why did FinFlow choose Provider X for European card payments?"

    # 2. Assess decision using live Hindsight recall + LLM reasoning
    assessment = await invalidation_service.assess_decision(question=question)

    # 3. Verify structural and status properties
    assert assessment.decision is not None and len(assessment.decision.strip()) > 0
    assert assessment.status in (DecisionStatus.REVIEW_REQUIRED, DecisionStatus.STALE)
    assert len(assessment.original_reasons) > 0

    # 4. Verify reason assessments are present
    assert len(assessment.affected_reasons) > 0
    for ar in assessment.affected_reasons:
        assert len(ar.original_reason.strip()) > 0
        assert ar.current_support in ("STILL_SUPPORTED", "WEAKENED", "INVALIDATED", "CONFLICTED")
        assert ar.impact in ("HIGH", "MEDIUM", "LOW")

    # 5. Verify source documents include both historical and later IDs
    assert len(assessment.source_documents) > 0
    # Must contain at least one historical document ID
    assert any(doc in ("ADR-014", "PAY-1042", "SLACK-001") for doc in assessment.source_documents)
    # Must contain at least one later document ID
    assert any(doc in ("SLACK-005", "PAY-3310", "ADR-028", "INC-2025-11", "PAY-2104") for doc in assessment.source_documents)

    # 6. Verify confidence bounds
    assert 0.0 < assessment.confidence <= 1.0
    assert assessment.confidence_rationale is not None

    # 7. Verify impact summary is non-empty
    assert len(assessment.impact_summary.strip()) > 0
