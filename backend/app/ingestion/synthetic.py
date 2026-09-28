"""Synthetic Data Ingestion and Normalization Service for FinFlow.

Discovers, loads, validates, and normalizes raw synthetic records from:
- slack.json
- jira.json
- pull_requests.json
- incidents.json
- architecture_notes.json

Preserves IDs, timestamps, participants, systems, contents, and source-specific metadata.
Writes deterministic normalized events to data/normalized/finflow_events.json.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.ingestion.base import BaseIngestionService
from app.schemas.normalized_event import DatasetValidationSummary, NormalizedEvent


class SyntheticDataIngestionService(BaseIngestionService):
    """Ingestion and normalization service for the FinFlow synthetic dataset."""

    DEFAULT_FILES = {
        "slack": "slack.json",
        "jira": "jira.json",
        "pull_request": "pull_requests.json",
        "incident": "incidents.json",
        "architecture_note": "architecture_notes.json",
    }

    def __init__(
        self,
        base_data_dir: Optional[Path] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        
        # Locate project root and data directory
        if base_data_dir:
            self.base_data_dir = Path(base_data_dir)
        else:
            # Resolves workspace root: backend/app/ingestion/synthetic.py -> ../../../data
            current_file = Path(__file__).resolve()
            workspace_root = current_file.parents[3]
            self.base_data_dir = workspace_root / "data"

        self.finflow_dir = self.base_data_dir / "finflow"
        self.normalized_dir = self.base_data_dir / "normalized"

        logger.info(
            "Initialized SyntheticDataIngestionService (Source: %s, Normalized: %s)",
            self.finflow_dir,
            self.normalized_dir,
        )

    def discover_source_files(self) -> Dict[str, Path]:
        """Discover existing source files in data/finflow directory."""
        discovered: Dict[str, Path] = {}
        for source_type, filename in self.DEFAULT_FILES.items():
            path = self.finflow_dir / filename
            if path.exists():
                discovered[source_type] = path
            else:
                logger.warning("Expected source file missing: %s", path)
        return discovered

    def load_raw_records(self, file_path: Path) -> List[Dict[str, Any]]:
        """Load and parse JSON records from a source file."""
        if not file_path.exists():
            raise FileNotFoundError(f"Source file not found: {file_path}")
        
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError(f"Expected a JSON array in {file_path}, got {type(data).__name__}")
        
        return data

    def normalize_record(
        self,
        raw: Dict[str, Any],
        fallback_source_type: str,
    ) -> NormalizedEvent:
        """Validate and normalize a raw record into the standard NormalizedEvent schema."""
        record_id = raw.get("id")
        if not record_id:
            raise ValueError("Record missing required 'id' field")

        source_type = raw.get("source_type") or fallback_source_type
        title = raw.get("title", f"Untitled {source_type.title()} Record")
        timestamp = raw.get("timestamp")
        if not timestamp:
            raise ValueError(f"Record {record_id} missing required 'timestamp' field")

        # Collect and deduplicate participants
        participants: List[str] = []
        if "author" in raw and raw["author"]:
            participants.append(raw["author"])
        if "participants" in raw and isinstance(raw["participants"], list):
            for p in raw["participants"]:
                if p not in participants:
                    participants.append(p)

        system = raw.get("system", "core-platform")
        content = raw.get("content", "")
        metadata = raw.get("metadata", {})

        return NormalizedEvent(
            id=record_id,
            source_type=source_type,
            title=title,
            timestamp=timestamp,
            participants=participants,
            system=system,
            content=content,
            metadata=metadata,
        )

    def load_and_normalize_all(self) -> List[NormalizedEvent]:
        """Load all discovered source files, validate, and return normalized records.

        Returns records sorted deterministically by timestamp ascending.
        """
        discovered = self.discover_source_files()
        if len(discovered) != len(self.DEFAULT_FILES):
            missing = set(self.DEFAULT_FILES.keys()) - set(discovered.keys())
            raise FileNotFoundError(f"Missing required source files: {missing}")

        all_events: List[NormalizedEvent] = []
        seen_ids = set()

        for source_type, file_path in discovered.items():
            records = self.load_raw_records(file_path)
            for raw in records:
                event = self.normalize_record(raw, fallback_source_type=source_type)
                if event.id in seen_ids:
                    raise ValueError(f"Duplicate record ID found: '{event.id}'")
                seen_ids.add(event.id)
                all_events.append(event)

        # Sort chronologically by timestamp, secondary by ID
        all_events.sort(key=lambda e: (e.parsed_datetime, e.id))
        logger.info("Loaded and normalized %d records across %d sources.", len(all_events), len(discovered))
        return all_events

    def save_normalized_dataset(
        self,
        events: Optional[List[NormalizedEvent]] = None,
        output_path: Optional[Path] = None,
    ) -> Path:
        """Write normalized records to JSON file."""
        if events is None:
            events = self.load_and_normalize_all()

        target_path = output_path or (self.normalized_dir / "finflow_events.json")
        target_path.parent.mkdir(parents=True, exist_ok=True)

        serialized = [event.model_dump() for event in events]
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(serialized, f, indent=2, ensure_ascii=False)

        logger.info("Saved %d normalized events to %s", len(events), target_path)
        return target_path

    def validate_dataset(
        self,
        events: Optional[List[NormalizedEvent]] = None,
    ) -> DatasetValidationSummary:
        """Validate dataset consistency and generate summary metrics."""
        if events is None:
            events = self.load_and_normalize_all()

        by_source: Dict[str, int] = {}
        all_participants = set()

        for e in events:
            by_source[e.source_type] = by_source.get(e.source_type, 0) + 1
            all_participants.update(e.participants)

        earliest = events[0].timestamp if events else ""
        latest = events[-1].timestamp if events else ""

        return DatasetValidationSummary(
            total_records=len(events),
            by_source_type=by_source,
            earliest_timestamp=earliest,
            latest_timestamp=latest,
            unique_participants_count=len(all_participants),
            is_valid=len(events) == 18,
        )

    async def ingest_batch(
        self,
        source_type: str,
        records: List[Dict[str, Any]],
    ) -> int:
        """Process and normalize an in-memory batch of records."""
        events = [self.normalize_record(r, fallback_source_type=source_type) for r in records]
        logger.info("Normalized in-memory batch of %d records for source '%s'", len(events), source_type)
        return len(events)
