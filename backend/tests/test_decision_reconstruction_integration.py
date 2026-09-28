"""Live Integration Test for Decision Reconstruction Agent (Phase 4).

Guarded by HINDSIGHT_INTEGRATION_TEST=true environment variable.
Executes live recall against Hindsight Cloud, reasons over evidence,
and verifies structural and provenance properties without hardcoding wording.
"""

import os
import pytest

from app.core.config import get_settings
from app.memory.hindsight import HindsightMemoryService
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import get_llm_service


RUN_INTEGRATION = os.getenv("HINDSIGHT_INTEGRATION_TEST", "").lower() in ("true", "1", "yes")


@pytest.mark.asyncio
@pytest.mark.skipif(
    not RUN_INTEGRATION,
    reason="Live Hindsight integration test skipped. Set HINDSIGHT_INTEGRATION_TEST=true to run.",
)
async def test_live_decision_reconstruction():
    """Verify live decision reconstruction against Hindsight Cloud and configured LLM."""
    settings = get_settings()

    memory_service = HindsightMemoryService(settings=settings)
    llm_service = get_llm_service(settings=settings)
    service = DecisionReconstructionService(
        memory_service=memory_service,
        llm_service=llm_service,
        settings=settings,
    )

    # 1. Ask question
    question = "Why did FinFlow choose Provider X for European card payments?"

    # 2. Reconstruct decision using live Hindsight recall + LLM reasoning
    explanation = await service.reconstruct_decision(question=question)

    # 3. Verify structural and evidence properties
    assert explanation.decision is not None and len(explanation.decision.strip()) > 0
    assert explanation.summary is not None and len(explanation.summary.strip()) > 0
    assert len(explanation.reasons) > 0, "Reconstructed decision must have at least one rationale point"

    # Verify every reason has valid text
    for reason_item in explanation.reasons:
        assert len(reason_item.reason.strip()) > 0
        assert isinstance(reason_item.evidence_ids, list)

    # Verify source documents
    assert len(explanation.source_documents) > 0, "Expected at least one cited source document ID"
    assert any(doc in ("ADR-014", "PAY-1042", "SLACK-001") for doc in explanation.source_documents)

    # Verify confidence is a valid bounded float
    assert 0.0 <= explanation.confidence <= 1.0

    # Verify evidence items were attached
    assert len(explanation.evidence) > 0
