"""Unit tests for Phase 7 Decision Memory Service and investigation evolution."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.decision import (
    DecisionReason,
    DecisionStatus,
    EvidenceItem,
    PreviousInvestigationItem,
    RememberDecisionRequest,
    RememberDecisionResponse,
    DecisionHistoryRequest,
    DecisionHistoryResponse,
)
from app.services.decision_memory_service import DecisionMemoryService
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import MockLLMService


@pytest.fixture
def mock_hindsight_service():
    """Mock HindsightMemoryService for hermetic unit testing."""
    service = MagicMock()
    service.default_bank_id = "finflow-why"
    service.retain_memory = MagicMock(return_value="WHY-INV-12345")
    service.aretain_memory = AsyncMock(return_value="WHY-INV-12345")
    service.recall_memories = MagicMock(return_value=[])
    service.arecall_memories = AsyncMock(return_value=[])
    return service


@pytest.fixture
def sample_remember_request():
    """Sample RememberDecisionRequest payload."""
    return RememberDecisionRequest(
        question="Why did FinFlow choose Provider X for European card payments?",
        decision="FinFlow selected Provider X for European acquired card payments.",
        status=DecisionStatus.REVIEW_REQUIRED,
        reasons=[
            DecisionReason(
                reason="Provider X had required European acquiring certifications.",
                evidence_ids=["ADR-014", "PAY-1042"],
            ),
            DecisionReason(
                reason="Compatible with Apex Retail ISO 8583 settlement pipeline.",
                evidence_ids=["SLACK-001"],
            ),
        ],
        changed_assumptions=[
            "Provider Y obtained BaFin regulatory approval for native card acquiring.",
            "Apex Retail completed REST v2 migration, eliminating the ISO 8583 dependency.",
        ],
        alternatives=["Provider Y", "Internal Build"],
        evidence_ids=["ADR-014", "PAY-1042", "SLACK-001", "SLACK-005", "PAY-3310"],
        impact_summary="Two high-impact constraints have changed. Formal review recommended.",
        confidence=0.95,
        decision_id="finflow-provider-x-europe",
    )


class TestDecisionMemoryService:
    """Test suite for DecisionMemoryService."""

    def test_serialization_structure(self, mock_hindsight_service, sample_remember_request):
        """Verify semantic, human-readable serialization includes all required sections."""
        service = DecisionMemoryService(memory_service=mock_hindsight_service)
        text = service.serialize_investigation_memory(sample_remember_request)

        assert "[WHY DECISION INVESTIGATION MEMORY]" in text
        assert "Decision Investigated: FinFlow selected Provider X for European acquired card payments." in text
        assert "Original Question: Why did FinFlow choose Provider X for European card payments?" in text
        assert "Validity Status: REVIEW REQUIRED" in text
        assert "Assessment Confidence: 0.95" in text
        assert "EXECUTIVE NARRATIVE:" in text
        assert "ORIGINAL DECISION REASONING:" in text
        assert "Provider X had required European acquiring certifications." in text
        assert "(Evidence: ADR-014, PAY-1042)" in text
        assert "ALTERNATIVES CONSIDERED:" in text
        assert "Provider Y, Internal Build" in text
        assert "CHANGED ASSUMPTIONS & TEMPORAL INVALIDATION:" in text
        assert "Provider Y obtained BaFin regulatory approval" in text
        assert "NOTE: This record represents prior AI reasoning" in text
        assert "primary organizational evidence must always supersede this prior reasoning" in text

    @pytest.mark.asyncio
    async def test_aretain_investigation(self, mock_hindsight_service, sample_remember_request):
        """Verify asynchronous retention forwards proper content, metadata, and tags to Hindsight."""
        service = DecisionMemoryService(memory_service=mock_hindsight_service)
        response = await service.aretain_investigation(sample_remember_request)

        assert response.success is True
        assert response.memory_type == "decision_investigation"
        assert response.decision_id == "finflow-provider-x-europe"
        assert response.document_id == "WHY-INV-12345"

        mock_hindsight_service.aretain_memory.assert_awaited_once()
        call_kwargs = mock_hindsight_service.aretain_memory.await_args.kwargs
        assert "[WHY DECISION INVESTIGATION MEMORY]" in call_kwargs["content"]
        assert call_kwargs["metadata"]["source_type"] == "decision_investigation"
        assert call_kwargs["metadata"]["memory_type"] == "decision_investigation"
        assert call_kwargs["metadata"]["status"] == "REVIEW REQUIRED"
        assert "why_investigation" in call_kwargs["tags"]

    @pytest.mark.asyncio
    async def test_arecall_previous_investigations(self, mock_hindsight_service):
        """Verify semantic recall filters and parses previous WHY investigation memories."""
        service = DecisionMemoryService(memory_service=mock_hindsight_service)

        mock_content = """[WHY DECISION INVESTIGATION MEMORY]
Investigation Date: 2026-04-12 10:00:00 UTC
Decision Investigated: FinFlow selected Provider X for European card payments.
Original Question: Why did FinFlow choose Provider X?
Validity Status: REVIEW REQUIRED
Assessment Confidence: 0.92

EXECUTIVE NARRATIVE:
WHY investigated the European card payment gateway selection.

ORIGINAL DECISION REASONING:
  1. European acquiring scheme licensing. (Evidence: ADR-014)
  2. Apex Retail ISO 8583 compatibility. (Evidence: PAY-1042)

ALTERNATIVES CONSIDERED:
Provider Y

CHANGED ASSUMPTIONS & TEMPORAL INVALIDATION:
  - Provider Y obtained European acquiring certification.
  - Apex Retail migrated to REST v2.
"""
        investigation_evidence = EvidenceItem(
            source_type="decision_investigation",
            title="Decision Investigation: Provider X",
            content=mock_content,
            external_url="WHY-INV-9999",
            confidence_score=0.92,
        )

        unrelated_evidence = EvidenceItem(
            source_type="slack",
            title="Discussion in #payments",
            content="Regular team chat without any investigation summary.",
            external_url="SLACK-8888",
        )

        mock_hindsight_service.arecall_memories.return_value = [
            investigation_evidence,
            unrelated_evidence,
        ]

        results = await service.arecall_previous_investigations(
            question="Why did FinFlow choose Provider X?",
        )

        assert len(results) == 1
        inv = results[0]
        assert isinstance(inv, PreviousInvestigationItem)
        assert inv.decision == "FinFlow selected Provider X for European card payments."
        assert inv.status == "REVIEW REQUIRED"
        assert inv.confidence == 0.92
        assert "ADR-014" in inv.evidence_ids
        assert len(inv.changed_assumptions) == 2
        assert inv.is_prior_ai_reasoning is True


class TestReconstructionIntegrationWithMemory:
    """Test decision reconstruction integration with previous investigation memories."""

    @pytest.mark.asyncio
    async def test_evidence_package_separates_primary_and_prior_reasoning(self, mock_hindsight_service):
        """Verify primary organizational evidence and prior investigation memories are explicitly segregated."""
        llm = MockLLMService()
        memory_service = DecisionMemoryService(memory_service=mock_hindsight_service)

        reconstruction_service = DecisionReconstructionService(
            memory_service=mock_hindsight_service,
            llm_service=llm,
            decision_memory_service=memory_service,
        )

        primary_mem = [
            EvidenceItem(
                source_type="architecture",
                title="ADR-014: European Card Acquirer Selection",
                content="Decision to use Provider X due to French CB licensing.",
                external_url="ADR-014",
            )
        ]

        prior_inv = [
            PreviousInvestigationItem(
                investigation_date="2026-04-12",
                decision="FinFlow selected Provider X for European card payments.",
                status="REVIEW REQUIRED",
                confidence=0.95,
                key_reasoning=["French CB licensing required."],
                evidence_ids=["ADR-014"],
                changed_assumptions=["Provider Y now certified."],
            )
        ]

        package = reconstruction_service._format_evidence_package(
            memories=primary_mem,
            prior_investigations=prior_inv,
        )

        # Verify SECTION A and SECTION B headers
        assert "=== SECTION A: PRIMARY ORGANIZATIONAL EVIDENCE (AUTHORITATIVE) ===" in package
        assert "DOCUMENT ID: ADR-014" in package
        assert ("=== SECTION B: PREVIOUS WHY INVESTIGATION MEMORY (PRIOR AI REASONING - CONTEXT ONLY) ===" in package or "=== SECTION B: PREVIOUS WHY INVESTIGATION MEMORY" in package)
        assert "Primary organizational evidence above takes absolute priority" in package
        assert "PRIOR STATUS: REVIEW REQUIRED" in package

    @pytest.mark.asyncio
    async def test_reconstruct_decision_populates_prior_investigations(self, mock_hindsight_service):
        """Verify reconstruct_decision populates prior_investigations on DecisionExplanation."""
        llm = MockLLMService()
        memory_service = MagicMock()
        memory_service.arecall_previous_investigations = AsyncMock(
            return_value=[
                PreviousInvestigationItem(
                    investigation_date="2026-04-12",
                    decision="FinFlow selected Provider X.",
                    status="REVIEW REQUIRED",
                    confidence=0.92,
                    key_reasoning=["European acquiring certification."],
                    evidence_ids=["ADR-014"],
                )
            ]
        )

        mock_hindsight_service.arecall_memories.return_value = [
            EvidenceItem(
                source_type="architecture",
                title="ADR-014",
                content="Direct acquiring compliance with French CB and Girocard schemes.",
                external_url="ADR-014",
            )
        ]

        reconstruction_service = DecisionReconstructionService(
            memory_service=mock_hindsight_service,
            llm_service=llm,
            decision_memory_service=memory_service,
        )

        explanation = await reconstruction_service.reconstruct_decision(
            question="Why did FinFlow choose Provider X for European card payments?",
        )

        assert explanation.prior_investigations_count == 1
        assert len(explanation.prior_investigations) == 1
        assert explanation.prior_investigations[0].status == "REVIEW REQUIRED"


class TestDecisionMemoryEndpoints:
    """Test suite for new API endpoints /remember and /history."""

    def test_remember_decision_endpoint(self, sample_remember_request):
        """Verify POST /api/v1/decisions/remember returns structured response."""
        client = TestClient(app)
        payload = sample_remember_request.model_dump()

        with patch("app.services.decision_memory_service.DecisionMemoryService.aretain_investigation") as mock_retain:
            mock_retain.return_value = RememberDecisionResponse(
                success=True,
                memory_type="decision_investigation",
                decision_id="finflow-provider-x-europe",
                message="Decision reasoning retained in Hindsight.",
                document_id="WHY-INV-12345",
                investigation_date="2026-04-12T10:00:00Z",
            )

            response = client.post("/api/v1/decisions/remember", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["memory_type"] == "decision_investigation"
            assert data["decision_id"] == "finflow-provider-x-europe"
            assert "Decision reasoning retained" in data["message"]

    def test_remember_decision_validation_empty(self):
        """Verify POST /api/v1/decisions/remember rejects empty decision."""
        client = TestClient(app)
        response = client.post("/api/v1/decisions/remember", json={"decision": "", "question": "Why?"})
        assert response.status_code in (400, 422)

    def test_history_endpoint(self):
        """Verify POST /api/v1/decisions/history returns list of previous investigations."""
        client = TestClient(app)
        payload = {"question": "Why did FinFlow choose Provider X for European card payments?"}

        with patch("app.services.decision_memory_service.DecisionMemoryService.arecall_previous_investigations") as mock_recall:
            mock_recall.return_value = [
                PreviousInvestigationItem(
                    investigation_date="2026-04-12",
                    decision="FinFlow selected Provider X.",
                    status="REVIEW REQUIRED",
                    confidence=0.95,
                    key_reasoning=["French CB licensing requirement."],
                    evidence_ids=["ADR-014"],
                    changed_assumptions=["Provider Y acquired license in 2026."],
                )
            ]

            response = client.post("/api/v1/decisions/history", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["count"] == 1
            assert len(data["investigations"]) == 1
            assert data["investigations"][0]["decision"] == "FinFlow selected Provider X."
            assert data["investigations"][0]["is_prior_ai_reasoning"] is True
