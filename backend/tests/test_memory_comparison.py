"""Unit tests for Phase 8 controlled before/after memory demonstration."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.decision import (
    DecisionExplanation,
    DecisionStatusEnum,
    EvidenceItem,
    MemoryComparisonRequest,
    MemoryComparisonResponse,
    MemoryMode,
    PreviousInvestigationItem,
)
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import MockLLMService
from app.services.memory_comparison_service import MemoryComparisonService


@pytest.fixture
def mock_hindsight_service():
    """Mock HindsightMemoryService."""
    service = MagicMock()
    service.default_bank_id = "finflow-why"
    service.recall_memories = MagicMock(return_value=[])
    service.arecall_memories = AsyncMock(return_value=[])
    return service


@pytest.fixture
def mock_decision_memory_service():
    """Mock DecisionMemoryService."""
    service = MagicMock()
    service.recall_previous_investigations = MagicMock(return_value=[])
    service.arecall_previous_investigations = AsyncMock(return_value=[])
    return service


class TestMemoryModeExecution:
    """Test suite verifying genuine distinction between memory modes."""

    @pytest.mark.asyncio
    async def test_no_memory_mode_never_calls_hindsight_recall(
        self,
        mock_hindsight_service,
        mock_decision_memory_service,
    ):
        """Verify that memory_mode='none' strictly bypasses Hindsight recall."""
        llm = MockLLMService()
        reconstruction_service = DecisionReconstructionService(
            memory_service=mock_hindsight_service,
            llm_service=llm,
            decision_memory_service=mock_decision_memory_service,
        )

        result = await reconstruction_service.reconstruct_decision(
            question="Why did FinFlow choose Provider X for European card payments?",
            memory_mode=MemoryMode.NONE,
        )

        # Assert Hindsight recall was NEVER called
        mock_hindsight_service.arecall_memories.assert_not_called()
        mock_decision_memory_service.arecall_previous_investigations.assert_not_called()

        # Assert honest insufficient evidence result
        assert result.status == DecisionStatusEnum.INSUFFICIENT_EVIDENCE
        assert len(result.evidence) == 0
        assert len(result.reasons) == 0
        assert result.confidence == 0.0
        assert "no organizational memory available" in result.summary.lower()

    @pytest.mark.asyncio
    async def test_hindsight_mode_calls_hindsight_recall(
        self,
        mock_hindsight_service,
        mock_decision_memory_service,
    ):
        """Verify that memory_mode='hindsight' retrieves persistent memory."""
        llm = MockLLMService()
        mock_hindsight_service.arecall_memories.return_value = [
            EvidenceItem(
                source_type="architecture",
                title="ADR-014: European Card Acquirer Selection",
                content="Direct acquiring compliance with French CB and German Girocard schemes.",
                external_url="ADR-014",
            )
        ]

        reconstruction_service = DecisionReconstructionService(
            memory_service=mock_hindsight_service,
            llm_service=llm,
            decision_memory_service=mock_decision_memory_service,
        )

        result = await reconstruction_service.reconstruct_decision(
            question="Why did FinFlow choose Provider X for European card payments?",
            memory_mode=MemoryMode.HINDSIGHT,
        )

        # Assert Hindsight recall WAS called
        mock_hindsight_service.arecall_memories.assert_awaited_once()
        assert len(result.evidence) == 1
        assert result.status == DecisionStatusEnum.ACTIVE
        assert len(result.reasons) > 0


class TestMemoryComparisonService:
    """Test suite for MemoryComparisonService orchestration."""

    @pytest.mark.asyncio
    async def test_run_comparison_executes_both_modes_independently(
        self,
        mock_hindsight_service,
        mock_decision_memory_service,
    ):
        """Verify that comparison runs both 'none' and 'hindsight' modes independently."""
        llm = MockLLMService()
        mock_hindsight_service.arecall_memories.return_value = [
            EvidenceItem(
                source_type="architecture",
                title="ADR-014: European Card Acquirer Selection",
                content="Direct acquiring compliance with French CB and German Girocard schemes.",
                external_url="ADR-014",
            ),
            EvidenceItem(
                source_type="jira",
                title="PAY-1042: Provider X Direct Integration",
                content="Protocol compatibility with Apex Retail ISO 8583 pipeline.",
                external_url="PAY-1042",
            ),
        ]

        reconstruction_service = DecisionReconstructionService(
            memory_service=mock_hindsight_service,
            llm_service=llm,
            decision_memory_service=mock_decision_memory_service,
        )

        comparison_service = MemoryComparisonService(
            reconstruction_service=reconstruction_service,
        )

        response: MemoryComparisonResponse = await comparison_service.run_comparison(
            question="Why did FinFlow choose Provider X for European card payments?",
        )

        # Assert structure of comparison response
        assert response.question == "Why did FinFlow choose Provider X for European card payments?"

        # Without memory assertions
        assert response.without_memory.memory_mode == MemoryMode.NONE
        assert response.without_memory.evidence_count == 0
        assert response.without_memory.prior_investigations_count == 0
        assert response.without_memory.citation_count == 0
        assert response.without_memory.status == "INSUFFICIENT EVIDENCE"
        assert response.without_memory.bank_id is None

        # With Hindsight assertions
        assert response.with_hindsight.memory_mode == MemoryMode.HINDSIGHT
        assert response.with_hindsight.evidence_count == 2
        assert response.with_hindsight.status == "DECISION RECONSTRUCTED"
        assert response.with_hindsight.citation_count >= 1
        assert response.with_hindsight.bank_id == "finflow-why"


class TestMemoryComparisonEndpoint:
    """Test suite for POST /api/v1/demo/memory-comparison API endpoint."""

    def test_memory_comparison_endpoint_success(self):
        """Verify POST /api/v1/demo/memory-comparison returns 200 with schema validation."""
        client = TestClient(app)

        with patch("app.services.memory_comparison_service.MemoryComparisonService.run_comparison") as mock_run:
            fake_without_explanation = DecisionExplanation(
                question="Why did FinFlow choose Provider X?",
                decision="Unknown / Insufficient Evidence",
                summary="No organizational memory available.",
                reasons=[],
                alternatives=[],
                constraints=[],
                evidence=[],
                participants=[],
                dependencies=[],
                conflicts=[],
                confidence=0.0,
                source_documents=[],
                status=DecisionStatusEnum.INSUFFICIENT_EVIDENCE,
            )

            fake_with_explanation = DecisionExplanation(
                question="Why did FinFlow choose Provider X?",
                decision="FinFlow selected Provider X for European card payments.",
                summary="Selected due to French CB license and Apex Retail ISO 8583 compatibility.",
                reasons=[
                    {"reason": "French CB licensing", "evidence_ids": ["ADR-014"]}
                ],
                alternatives=[
                    {"name": "Provider Y", "reason_not_selected": "Lacked license", "evidence_ids": ["ADR-014"]}
                ],
                constraints=["Q3 2024 deadline"],
                evidence=[
                    EvidenceItem(source_type="architecture", title="ADR-014", content="license", external_url="ADR-014")
                ],
                participants=["marcus.vance"],
                dependencies=["Legacy gateway"],
                conflicts=[],
                confidence=0.95,
                source_documents=["ADR-014"],
                status=DecisionStatusEnum.ACTIVE,
            )

            from app.schemas.decision import MemoryModeResult

            mock_run.return_value = MemoryComparisonResponse(
                question="Why did FinFlow choose Provider X?",
                without_memory=MemoryModeResult(
                    memory_mode=MemoryMode.NONE,
                    status="INSUFFICIENT EVIDENCE",
                    evidence_count=0,
                    prior_investigations_count=0,
                    citation_count=0,
                    bank_id=None,
                    narrative="No memory available.",
                    explanation=fake_without_explanation,
                ),
                with_hindsight=MemoryModeResult(
                    memory_mode=MemoryMode.HINDSIGHT,
                    status="DECISION RECONSTRUCTED",
                    evidence_count=1,
                    prior_investigations_count=0,
                    citation_count=1,
                    bank_id="finflow-why",
                    narrative="Decision successfully reconstructed with Hindsight.",
                    explanation=fake_with_explanation,
                ),
            )

            response = client.post(
                "/api/v1/demo/memory-comparison",
                json={"question": "Why did FinFlow choose Provider X?"},
            )

            assert response.status_code == 200
            data = response.json()
            assert "without_memory" in data
            assert "with_hindsight" in data
            assert data["without_memory"]["status"] == "INSUFFICIENT EVIDENCE"
            assert data["without_memory"]["evidence_count"] == 0
            assert data["with_hindsight"]["status"] == "DECISION RECONSTRUCTED"
            assert data["with_hindsight"]["evidence_count"] == 1

    def test_memory_comparison_endpoint_empty_question(self):
        """Verify POST /api/v1/demo/memory-comparison rejects empty question."""
        client = TestClient(app)
        response = client.post(
            "/api/v1/demo/memory-comparison",
            json={"question": ""},
        )
        assert response.status_code in (400, 422)
