"""API tests for Decision Reconstruction endpoint."""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.decision import (
    DecisionExplanation,
    DecisionReason,
    DecisionStatusEnum,
)

client = TestClient(app)


def test_reconstruct_decision_endpoint_success():
    """Test successful POST /api/v1/decisions/reconstruct."""
    mock_explanation = DecisionExplanation(
        question="Why did FinFlow choose Provider X for European card payments?",
        decision="FinFlow selected Provider X for European card payments.",
        summary="Provider X satisfied domestic licensing and ISO 8583 settlement pipeline constraints.",
        reasons=[
            DecisionReason(
                reason="Domestic licensing compliance with French CB and German Girocard.",
                evidence_ids=["ADR-014", "PAY-1042"],
            )
        ],
        alternatives=[],
        constraints=["Q3 2024 compliance deadline"],
        evidence=[],
        participants=["devon.chen", "elena.rostova"],
        dependencies=["Apex Retail settlement pipeline"],
        confidence=0.90,
        confidence_rationale="High quality multi-source evidence",
        source_documents=["ADR-014", "PAY-1042"],
    )

    with patch(
        "app.services.decision_reconstruction.DecisionReconstructionService.reconstruct_decision",
        new_callable=AsyncMock,
        return_value=mock_explanation,
    ):
        response = client.post(
            "/api/v1/decisions/reconstruct",
            json={"question": "Why did FinFlow choose Provider X for European card payments?"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["decision"] == "FinFlow selected Provider X for European card payments."
        assert len(data["reasons"]) == 1
        assert data["confidence"] == 0.90
        assert "ADR-014" in data["source_documents"]


def test_reconstruct_decision_endpoint_validation_error():
    """Test POST /api/v1/decisions/reconstruct with empty question returns 422 or 400."""
    response = client.post(
        "/api/v1/decisions/reconstruct",
        json={"question": ""},
    )
    assert response.status_code in (400, 422)


def test_reconstruct_decision_endpoint_timeout_handling():
    """Test that upstream timeout raises 504 Gateway Timeout."""
    with patch(
        "app.services.decision_reconstruction.DecisionReconstructionService.reconstruct_decision",
        new_callable=AsyncMock,
        side_effect=TimeoutError("Connection timed out"),
    ):
        response = client.post(
            "/api/v1/decisions/reconstruct",
            json={"question": "Why did FinFlow choose Provider X?"},
        )
        assert response.status_code == 504
        assert "timed out" in response.json()["detail"].lower()


def test_reconstruct_decision_endpoint_upstream_error_handling():
    """Test that upstream runtime error raises 503 Service Unavailable."""
    with patch(
        "app.services.decision_reconstruction.DecisionReconstructionService.reconstruct_decision",
        new_callable=AsyncMock,
        side_effect=RuntimeError("Groq API error (HTTP 401): Unauthorized"),
    ):
        response = client.post(
            "/api/v1/decisions/reconstruct",
            json={"question": "Why did FinFlow choose Provider X?"},
        )
        assert response.status_code == 503
        assert "upstream" in response.json()["detail"].lower()
        # Verify no secrets or internal tokens are exposed in error response
        assert "gsk_" not in response.json()["detail"]


def test_reconstruct_decision_endpoint_with_memory_mode_none():
    """Test POST /api/v1/decisions/reconstruct passes memory_mode='none'."""
    with patch(
        "app.services.decision_reconstruction.DecisionReconstructionService.reconstruct_decision",
        new_callable=AsyncMock,
    ) as mock_recon:
        mock_recon.return_value = DecisionExplanation(
            question="Why Provider X?",
            decision="Unknown",
            summary="Insufficient evidence",
            confidence=0.0,
            status=DecisionStatusEnum.INSUFFICIENT_EVIDENCE,
        )
        response = client.post(
            "/api/v1/decisions/reconstruct",
            json={"question": "Why Provider X?", "memory_mode": "none"},
        )
        assert response.status_code == 200
        mock_recon.assert_called_once()
        call_kwargs = mock_recon.call_args[1]
        assert call_kwargs.get("memory_mode") == "none" or call_kwargs.get("memory_mode").value == "none"

