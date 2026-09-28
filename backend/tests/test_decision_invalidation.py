"""Unit tests for Decision Invalidation and Temporal Reasoning Engine (Phase 5).

Tests status classification, temporal ordering, reason matching, contradiction handling,
insufficient evidence, confidence heuristic, high-impact reason weighting, and API endpoints.
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.decision import (
    AssessDecisionRequest,
    DecisionAssessment,
    DecisionExplanation,
    DecisionReason,
    DecisionStatus,
    EvidenceItem,
    ReasonAssessment,
)
from app.services.decision_invalidation import DecisionInvalidationService
from app.services.llm_service import MockLLMService

client = TestClient(app)


@pytest.fixture
def sample_historical_decision():
    """Sample historical decision from 2024."""
    return DecisionExplanation(
        question="Why did FinFlow choose Provider X for European card payments?",
        decision="FinFlow selected Provider X for European acquired card payments.",
        summary="Provider X was selected because it held French CB and German Girocard licenses and supported Apex Retail ISO 8583.",
        reasons=[
            DecisionReason(
                reason="Mandatory compliance with French CB and German Girocard schemes by Q3 2024.",
                evidence_ids=["ADR-014", "PAY-1042"],
            ),
            DecisionReason(
                reason="Compatibility with Apex Retail ISO 8583 settlement pipeline.",
                evidence_ids=["ADR-014", "PAY-1042", "SLACK-001"],
            ),
        ],
        alternatives=[],
        constraints=["Q3 2024 compliance deadline"],
        evidence=[
            EvidenceItem(
                source_type="architecture",
                title="ADR-014",
                content="Selected Provider X in April 2024.",
                recorded_at=datetime(2024, 4, 5, 14, 0),
                external_url="ADR-014",
            )
        ],
        participants=["marcus.vance", "elena.rostova"],
        dependencies=["Legacy Payment Gateway adapter"],
        timeframe=None,
        conflicts=[],
        confidence=0.90,
        source_documents=["ADR-014", "PAY-1042", "SLACK-001"],
    )


@pytest.fixture
def sample_later_evidence():
    """Sample later evidence from 2026."""
    return [
        EvidenceItem(
            source_type="slack",
            title="SLACK-005: Partner announcement: Provider Y obtains European acquiring license",
            content="Provider Y officially received BaFin and ECB regulatory approval for direct CB and Girocard acquiring.",
            recorded_at=datetime(2026, 2, 18, 9, 30),
            external_url="SLACK-005",
        ),
        EvidenceItem(
            source_type="jira",
            title="PAY-3310: Apex Retail Migration to REST API v2 Complete",
            content="Apex Retail completed multi-quarter migration to REST API v2. Legacy ISO 8583 socket server has zero inbound traffic.",
            recorded_at=datetime(2026, 3, 5, 14, 10),
            external_url="PAY-3310",
        ),
        EvidenceItem(
            source_type="architecture_note",
            title="ADR-028: Feasibility Assessment: Decommissioning Legacy Payment Gateway & Provider X",
            content="Every constraint that originally mandated Provider X has expired or resolved.",
            recorded_at=datetime(2026, 4, 12, 15, 30),
            external_url="ADR-028",
        ),
    ]


def test_status_classification_policy_review_required():
    """1. Test that when a HIGH-impact reason is INVALIDATED, status is REVIEW_REQUIRED."""
    service = DecisionInvalidationService()

    affected_reasons = [
        ReasonAssessment(
            original_reason="European certification",
            original_evidence_ids=["ADR-014"],
            current_support="INVALIDATED",
            new_evidence_ids=["SLACK-005"],
            assessment="Provider Y obtained BaFin license.",
            impact="HIGH",
            confidence=0.95,
        ),
        ReasonAssessment(
            original_reason="ISO 8583 pipeline",
            original_evidence_ids=["ADR-014"],
            current_support="STILL_SUPPORTED",
            new_evidence_ids=[],
            assessment="Still in use.",
            impact="MEDIUM",
            confidence=0.90,
        ),
    ]

    status = service._evaluate_status_policy(affected_reasons)
    assert status == DecisionStatus.REVIEW_REQUIRED


def test_status_classification_policy_active():
    """2. Test that when all reasons remain supported, status is ACTIVE."""
    service = DecisionInvalidationService()

    affected_reasons = [
        ReasonAssessment(
            original_reason="European certification",
            original_evidence_ids=["ADR-014"],
            current_support="STILL_SUPPORTED",
            new_evidence_ids=[],
            assessment="No changes.",
            impact="HIGH",
            confidence=0.90,
        )
    ]

    status = service._evaluate_status_policy(affected_reasons)
    assert status == DecisionStatus.ACTIVE


def test_status_classification_policy_conflicted():
    """3. Test that direct contradictory evidence triggers CONFLICTED status."""
    service = DecisionInvalidationService()

    affected_reasons = [
        ReasonAssessment(
            original_reason="Settlement reliability",
            original_evidence_ids=["ADR-014"],
            current_support="CONFLICTED",
            new_evidence_ids=["INC-2025-11"],
            assessment="Historical record claims 99.9% uptime while recent audit claims continuous SLA breaches.",
            impact="HIGH",
            confidence=0.85,
        )
    ]

    status = service._evaluate_status_policy(affected_reasons)
    assert status == DecisionStatus.CONFLICTED


def test_temporal_filtering(sample_historical_decision, sample_later_evidence):
    """4. Test temporal filtering separates historical records from later developments."""
    combined = sample_historical_decision.evidence + sample_later_evidence

    # Extract later candidates
    service = DecisionInvalidationService()
    valid_ids = service._extract_valid_document_ids(combined)

    assert "ADR-014" in valid_ids
    assert "SLACK-005" in valid_ids
    assert "PAY-3310" in valid_ids


@pytest.mark.asyncio
async def test_insufficient_evidence_handling():
    """5. Test that unsupported question returns INSUFFICIENT_EVIDENCE status."""
    mock_reconstruction = MagicMock()
    mock_reconstruction.reconstruct_decision = AsyncMock(
        return_value=DecisionExplanation(
            question="Why did FinFlow choose AWS Lambda in 2023?",
            decision="Unknown / Insufficient Evidence",
            summary="Insufficient historical evidence to reconstruct this decision.",
            confidence=0.0,
        )
    )

    service = DecisionInvalidationService(reconstruction_service=mock_reconstruction)
    assessment = await service.assess_decision("Why did FinFlow choose AWS Lambda in 2023?")

    assert assessment.status == DecisionStatus.INSUFFICIENT_EVIDENCE
    assert assessment.confidence == 0.0
    assert "Insufficient" in assessment.impact_summary


def test_confidence_calculation(sample_later_evidence):
    """6. Test explainable confidence calculation heuristic for assessments."""
    service = DecisionInvalidationService()

    affected_reasons = [
        ReasonAssessment(
            original_reason="License requirement",
            original_evidence_ids=["ADR-014"],
            current_support="INVALIDATED",
            new_evidence_ids=["SLACK-005"],
            assessment="Provider Y now licensed.",
            impact="HIGH",
            confidence=0.95,
        ),
        ReasonAssessment(
            original_reason="Apex Retail ISO requirement",
            original_evidence_ids=["PAY-1042"],
            current_support="INVALIDATED",
            new_evidence_ids=["PAY-3310"],
            assessment="Apex Retail migrated to v2.",
            impact="HIGH",
            confidence=0.95,
        ),
    ]

    score, rationale = service._calculate_assessment_confidence(
        affected_reasons=affected_reasons,
        later_evidence=sample_later_evidence,
        status=DecisionStatus.REVIEW_REQUIRED,
    )

    assert 0.85 <= score <= 0.95
    assert "later source types" in rationale
    assert "REVIEW REQUIRED" in rationale


def test_citation_validation_and_sanitization():
    """7. Test that hallucinated citations are stripped and only real IDs preserved."""
    service = DecisionInvalidationService()
    valid_ids = {"ADR-014", "SLACK-005", "PAY-3310"}

    raw_affected = [
        {
            "original_reason": "Test reason",
            "original_evidence_ids": ["ADR-014", "HALLUCINATED-DOC-1"],
            "current_support": "INVALIDATED",
            "new_evidence_ids": ["SLACK-005", "HALLUCINATED-DOC-2"],
            "assessment": "Assessment text.",
            "impact": "HIGH",
            "confidence": 0.90,
        }
    ]

    sanitized = service._sanitize_affected_reasons(raw_affected, valid_ids)
    assert len(sanitized) == 1
    assert sanitized[0].original_evidence_ids == ["ADR-014"]
    assert sanitized[0].new_evidence_ids == ["SLACK-005"]


@pytest.mark.asyncio
async def test_full_invalidation_pipeline_with_mock(
    sample_historical_decision,
    sample_later_evidence,
):
    """8. Test full invalidation pipeline end-to-end with MockLLMService."""
    mock_reconstruction = MagicMock()
    mock_reconstruction.reconstruct_decision = AsyncMock(return_value=sample_historical_decision)

    mock_memory = MagicMock()
    mock_memory.arecall_memories = AsyncMock(return_value=sample_later_evidence)

    mock_llm = MockLLMService()

    service = DecisionInvalidationService(
        memory_service=mock_memory,
        reconstruction_service=mock_reconstruction,
        llm_service=mock_llm,
    )

    assessment = await service.assess_decision("Why did FinFlow choose Provider X for European card payments?")

    assert assessment.status == DecisionStatus.REVIEW_REQUIRED
    assert len(assessment.affected_reasons) >= 1
    assert any(ar.current_support == "INVALIDATED" for ar in assessment.affected_reasons)
    assert any("Provider Y" in ca or "Apex Retail" in ca for ca in assessment.changed_assumptions)
    assert 0.0 < assessment.confidence <= 1.0


def test_assess_decision_api_endpoint(sample_historical_decision, sample_later_evidence):
    """9. Test POST /api/v1/decisions/assess REST API endpoint."""
    mock_assessment = DecisionAssessment(
        decision="FinFlow selected Provider X for European card payments.",
        status=DecisionStatus.REVIEW_REQUIRED,
        original_reasons=[
            DecisionReason(reason="Mandatory compliance", evidence_ids=["ADR-014"])
        ],
        changed_assumptions=["Provider Y now certified"],
        affected_reasons=[
            ReasonAssessment(
                original_reason="Mandatory compliance",
                original_evidence_ids=["ADR-014"],
                current_support="INVALIDATED",
                new_evidence_ids=["SLACK-005"],
                assessment="Provider Y certified.",
                impact="HIGH",
                confidence=0.95,
            )
        ],
        new_evidence=[],
        impact_summary="High-impact constraints have changed. Decision should be reviewed.",
        confidence=0.92,
        confidence_rationale="High quality temporal evidence",
        evidence=[],
        source_documents=["ADR-014", "SLACK-005"],
    )

    with patch(
        "app.services.decision_invalidation.DecisionInvalidationService.assess_decision",
        new_callable=AsyncMock,
        return_value=mock_assessment,
    ):
        response = client.post(
            "/api/v1/decisions/assess",
            json={"question": "Why did FinFlow choose Provider X for European card payments?"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "REVIEW REQUIRED"
        assert len(data["affected_reasons"]) == 1
        assert "SLACK-005" in data["source_documents"]


def test_assess_decision_api_endpoint_validation():
    """10. Test POST /api/v1/decisions/assess empty input validation."""
    response = client.post(
        "/api/v1/decisions/assess",
        json={"question": ""},
    )
    assert response.status_code in (400, 422)
