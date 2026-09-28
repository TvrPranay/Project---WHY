"""Unit tests for Hindsight memory service and FinFlow retention pipeline.

Uses isolated test doubles for SDK calls so unit tests run deterministically
without requiring a live Hindsight server.
"""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
import pytest
from hindsight_client import RecallResponse, RecallResult, RetainResponse
from app.core.config import Settings
from app.memory.finflow_memory_ingestion import FinFlowMemoryIngestionService
from app.memory.hindsight import HindsightMemoryService
from app.schemas.normalized_event import NormalizedEvent


@pytest.fixture
def mock_settings() -> Settings:
    """Fixture providing controlled Hindsight settings."""
    return Settings(
        HINDSIGHT_BASE_URL="http://mock-hindsight:8888",
        HINDSIGHT_API_KEY="test-mock-key",
        HINDSIGHT_BANK_ID="test-mock-bank",
    )


@pytest.fixture
def sample_normalized_event() -> NormalizedEvent:
    """Fixture providing a sample FinFlow normalized event."""
    return NormalizedEvent(
        id="SLACK-001",
        source_type="slack",
        title="Discussion on European acquiring provider selection",
        timestamp="2024-03-12T14:22:15Z",
        participants=["marcus.vance", "elena.rostova"],
        system="payment-orchestrator",
        content="Debate between Provider X, Provider Y, and Provider Z.",
        metadata={"channel": "#proj-eu-payments", "team": "payments-core"},
    )


def test_hindsight_configuration(mock_settings: Settings):
    """Verify settings properties for Hindsight."""
    service = HindsightMemoryService(settings=mock_settings)
    assert service.base_url == "http://mock-hindsight:8888"
    assert service.api_key == "test-mock-key"
    assert service.default_bank_id == "test-mock-bank"


def test_client_construction_and_reuse(mock_settings: Settings):
    """Verify Hindsight SDK client is created once and reused across invocations."""
    service = HindsightMemoryService(settings=mock_settings)

    with patch("app.memory.hindsight.Hindsight") as mock_hindsight_cls:
        mock_instance = MagicMock()
        mock_hindsight_cls.return_value = mock_instance

        client1 = service.get_client()
        client2 = service.get_client()

        assert client1 is client2
        assert mock_hindsight_cls.call_count == 1
        mock_hindsight_cls.assert_called_once_with(
            base_url="http://mock-hindsight:8888",
            api_key="test-mock-key",
            timeout=60.0,
        )


def test_retain_memory_payload_transformation(
    mock_settings: Settings,
    sample_normalized_event: NormalizedEvent,
):
    """Verify transformation of NormalizedEvent into Hindsight retain payload."""
    service = HindsightMemoryService(settings=mock_settings)
    mock_client = MagicMock()
    mock_client.retain.return_value = RetainResponse(
        bank_id="test-mock-bank",
        success=True,
        items_count=1,
        **{"async": False},
    )
    service._client = mock_client

    result_id = service.retain_memory(
        content=sample_normalized_event.content,
        context=f"{sample_normalized_event.source_type}: {sample_normalized_event.title}",
        document_id=sample_normalized_event.id,
        timestamp=sample_normalized_event.parsed_datetime,
        metadata={"source_type": sample_normalized_event.source_type, "system": sample_normalized_event.system},
        tags=[sample_normalized_event.source_type, sample_normalized_event.system],
        bank_id="test-mock-bank",
    )

    assert result_id == "SLACK-001"
    mock_client.retain.assert_called_once()
    kwargs = mock_client.retain.call_args.kwargs

    assert kwargs["bank_id"] == "test-mock-bank"
    assert kwargs["content"] == sample_normalized_event.content
    assert kwargs["document_id"] == "SLACK-001"
    assert kwargs["context"] == "slack: Discussion on European acquiring provider selection"
    assert kwargs["timestamp"] == datetime(2024, 3, 12, 14, 22, 15, tzinfo=timezone.utc)
    assert kwargs["metadata"] == {"source_type": "slack", "system": "payment-orchestrator"}
    assert kwargs["tags"] == ["slack", "payment-orchestrator"]


def test_recall_memories_normalization(mock_settings: Settings):
    """Verify SDK RecallResponse is cleanly normalized into EvidenceItem objects."""
    service = HindsightMemoryService(settings=mock_settings)
    mock_client = MagicMock()

    mock_result = RecallResult(
        id="mem-123",
        text="FinFlow adopted Provider X for Cartes Bancaires support in ADR-014.",
        type="architecture",
        document_id="ADR-014",
        context="ADR-014: Selection of Provider X",
        metadata={"source_type": "architecture_note", "author": "marcus.vance"},
        scores={"final": 0.94},
    )

    mock_response = RecallResponse(results=[mock_result])
    mock_client.recall.return_value = mock_response
    service._client = mock_client

    evidence = service.recall_memories(
        query="Why was Provider X selected?",
        bank_id="test-mock-bank",
    )

    assert len(evidence) == 1
    item = evidence[0]
    assert item.content == "FinFlow adopted Provider X for Cartes Bancaires support in ADR-014."
    assert item.title == "ADR-014: Selection of Provider X"
    assert item.source_type == "architecture_note"
    assert item.author == "marcus.vance"
    assert item.external_url == "ADR-014"
    assert item.confidence_score == 0.94


def test_connection_probe_failure_handled_gracefully(mock_settings: Settings):
    """Verify check_connection does not raise when Hindsight is unreachable."""
    service = HindsightMemoryService(settings=mock_settings)

    with patch("httpx.Client") as mock_client_cls:
        mock_http = MagicMock()
        mock_http.__enter__.return_value = mock_http
        mock_http.get.side_effect = Exception("Connection refused to host:8888")
        mock_client_cls.return_value = mock_http

        probe = service.check_connection()
        assert probe["reachable"] is False
        assert probe["configured"] is True
        assert "Connection probe failed" in probe["details"]


def test_finflow_memory_ingestion_pipeline(mock_settings: Settings):
    """Verify FinFlowMemoryIngestionService processes all records."""
    mock_memory_service = MagicMock(spec=HindsightMemoryService)
    mock_memory_service.retain_memory.return_value = "doc-ok"

    ingestion_service = FinFlowMemoryIngestionService(
        memory_service=mock_memory_service,
        settings=mock_settings,
    )

    mock_events = [
        NormalizedEvent(
            id=f"EVT-{i}",
            source_type="slack",
            title=f"Event {i}",
            timestamp="2024-03-12T14:22:15Z",
            participants=["devon.chen"],
            system="core",
            content=f"Content {i}",
            metadata={},
        )
        for i in range(1, 4)
    ]

    summary = ingestion_service.retain_all_events(events=mock_events, ensure_bank=True)

    assert summary["status"] == "success"
    assert summary["attempted"] == 3
    assert summary["succeeded"] == 3
    assert summary["failed"] == 0
    assert len(summary["retained_ids"]) == 3
    assert mock_memory_service.retain_memory.call_count == 3


def test_api_memory_recall_endpoint(client):
    """Verify GET /api/v1/memory/recall endpoint returns typed memories."""
    with patch("hindsight_client.Hindsight.arecall") as mock_arecall:
        mock_arecall.return_value = RecallResponse(
            results=[
                RecallResult(
                    id="mem-1",
                    text="Provider X selected in ADR-014",
                    type="architecture",
                    document_id="ADR-014",
                    context="ADR-014",
                    scores={"final": 0.95},
                )
            ]
        )
        response = client.get("/api/v1/memory/recall?q=Why+did+FinFlow+choose+Provider+X?")
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "Why did FinFlow choose Provider X?"
        assert data["total_recalled"] == 1
        assert data["memories"][0]["external_url"] == "ADR-014"
        assert data["memories"][0]["confidence_score"] == 0.95


def test_api_memory_ingest_endpoint(client):
    """Verify POST /api/v1/memory/ingest endpoint retains records."""
    with patch("hindsight_client.Hindsight.acreate_bank"), \
         patch("hindsight_client.Hindsight.aretain") as mock_aretain:
        mock_aretain.return_value = MagicMock(document_id="doc-ok")

        response = client.post("/api/v1/memory/ingest")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["attempted"] == 18
        assert data["succeeded"] == 18
        assert data["failed"] == 0
