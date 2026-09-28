"""Unit tests for FinFlow synthetic dataset and normalization service."""

import json
from datetime import datetime
from pathlib import Path
import pytest
from app.ingestion.synthetic import SyntheticDataIngestionService
from app.schemas.normalized_event import NormalizedEvent


@pytest.fixture(scope="module")
def data_dir() -> Path:
    """Resolve data directory path."""
    current_file = Path(__file__).resolve()
    # backend/tests/test_dataset.py -> ../../data
    workspace_root = current_file.parents[2]
    return workspace_root / "data"


@pytest.fixture(scope="module")
def ingestion_service(data_dir: Path) -> SyntheticDataIngestionService:
    """Fixture providing initialized SyntheticDataIngestionService."""
    return SyntheticDataIngestionService(base_data_dir=data_dir)


def test_source_files_exist_and_load(ingestion_service: SyntheticDataIngestionService):
    """Verify that all 5 raw source files exist and contain valid JSON arrays."""
    discovered = ingestion_service.discover_source_files()
    assert len(discovered) == 5
    assert set(discovered.keys()) == {
        "slack",
        "jira",
        "pull_request",
        "incident",
        "architecture_note",
    }

    for source_type, file_path in discovered.items():
        records = ingestion_service.load_raw_records(file_path)
        assert isinstance(records, list)
        assert len(records) > 0


def test_expected_source_counts(ingestion_service: SyntheticDataIngestionService):
    """Verify specific record counts per source type."""
    discovered = ingestion_service.discover_source_files()
    
    expected_counts = {
        "slack": 5,
        "jira": 4,
        "pull_request": 3,
        "incident": 3,
        "architecture_note": 3,
    }

    for source_type, expected in expected_counts.items():
        records = ingestion_service.load_raw_records(discovered[source_type])
        assert len(records) == expected, f"Expected {expected} records for {source_type}, got {len(records)}"


def test_unique_record_ids(ingestion_service: SyntheticDataIngestionService):
    """Verify that all record IDs across all sources are strictly unique."""
    events = ingestion_service.load_and_normalize_all()
    ids = [e.id for e in events]
    assert len(ids) == len(set(ids)), f"Duplicate IDs detected: {len(ids)} total vs {len(set(ids))} unique"
    assert len(events) == 18


def test_valid_timestamps(ingestion_service: SyntheticDataIngestionService):
    """Verify all timestamps parse as valid ISO 8601 datetimes."""
    events = ingestion_service.load_and_normalize_all()
    for event in events:
        dt = event.parsed_datetime
        assert isinstance(dt, datetime)
        assert dt.year in (2024, 2025, 2026)


def test_recognized_source_types(ingestion_service: SyntheticDataIngestionService):
    """Verify all source types match recognized vocabulary."""
    valid_types = {"slack", "jira", "pull_request", "incident", "architecture_note"}
    events = ingestion_service.load_and_normalize_all()
    for event in events:
        assert event.source_type in valid_types


def test_temporal_span_historical_and_later(ingestion_service: SyntheticDataIngestionService):
    """Verify dataset contains both historical records (2024-2025) and later records (2026)."""
    events = ingestion_service.load_and_normalize_all()
    
    records_2024 = [e for e in events if e.parsed_datetime.year == 2024]
    records_2025 = [e for e in events if e.parsed_datetime.year == 2025]
    records_2026 = [e for e in events if e.parsed_datetime.year == 2026]

    assert len(records_2024) >= 5, "Expected at least 5 records from 2024 (historical decision)"
    assert len(records_2025) >= 5, "Expected at least 5 records from 2025 (friction/drift)"
    assert len(records_2026) >= 3, "Expected at least 3 records from 2026 (new information)"


def test_metadata_preservation(ingestion_service: SyntheticDataIngestionService):
    """Verify normalization preserves source-specific metadata without data loss."""
    events = ingestion_service.load_and_normalize_all()
    event_map = {e.id: e for e in events}

    # Verify Slack metadata
    slack_001 = event_map["SLACK-001"]
    assert slack_001.metadata.get("channel") == "#proj-eu-payments"
    assert "sarah.k" in slack_001.participants

    # Verify Jira metadata
    pay_1042 = event_map["PAY-1042"]
    assert pay_1042.metadata.get("ticket_key") == "PAY-1042"
    assert "p0" in pay_1042.metadata.get("labels", [])

    # Verify Incident metadata
    inc_2024 = event_map["INC-2024-09"]
    assert inc_2024.metadata.get("severity") == "Sev-2"
    assert inc_2024.metadata.get("duration_minutes") == 75

    # Verify PR metadata
    pr_412 = event_map["PR-412"]
    assert pr_412.metadata.get("pr_number") == 412
    assert pr_412.metadata.get("status") == "merged"

    # Verify Architecture Note metadata
    adr_014 = event_map["ADR-014"]
    assert adr_014.metadata.get("doc_type") == "Architecture Decision Record"


def test_save_and_reload_normalized_dataset(ingestion_service: SyntheticDataIngestionService, tmp_path: Path):
    """Verify normalized dataset can be saved and loaded identically."""
    events = ingestion_service.load_and_normalize_all()
    output_path = tmp_path / "events.json"

    saved_path = ingestion_service.save_normalized_dataset(events, output_path=output_path)
    assert saved_path.exists()

    with open(saved_path, "r", encoding="utf-8") as f:
        reloaded_raw = json.load(f)

    assert len(reloaded_raw) == 18
    reloaded_events = [NormalizedEvent(**item) for item in reloaded_raw]
    assert len(reloaded_events) == 18
    assert [e.id for e in reloaded_events] == [e.id for e in events]


def test_validation_summary(ingestion_service: SyntheticDataIngestionService):
    """Verify validation summary produces expected aggregate metrics."""
    summary = ingestion_service.validate_dataset()
    assert summary.is_valid is True
    assert summary.total_records == 18
    assert summary.unique_participants_count >= 8
    assert summary.earliest_timestamp.startswith("2024-02-15")
    assert summary.latest_timestamp.startswith("2026-04-12")
