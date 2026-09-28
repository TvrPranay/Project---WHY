"""FinFlow Organizational Dataset Retention Pipeline for Hindsight.

Coordinates reading normalized FinFlow records and retaining each document
individually into Hindsight while preserving document IDs, timestamps,
source categories, systems, and metadata for full traceability.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.ingestion.synthetic import SyntheticDataIngestionService
from app.memory.hindsight import HindsightMemoryService
from app.schemas.normalized_event import NormalizedEvent


class FinFlowMemoryIngestionService:
    """Service orchestrating retention of FinFlow organizational events into Hindsight."""

    def __init__(
        self,
        memory_service: Optional[HindsightMemoryService] = None,
        data_service: Optional[SyntheticDataIngestionService] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.memory_service = memory_service or HindsightMemoryService(self.settings)
        self.data_service = data_service or SyntheticDataIngestionService(settings=self.settings)
        self.bank_id = self.settings.HINDSIGHT_BANK_ID

        logger.info(
            "Initialized FinFlowMemoryIngestionService (Target Bank: %s)",
            self.bank_id,
        )

    def load_normalized_records(self) -> List[NormalizedEvent]:
        """Load normalized events from data directory or raw source files."""
        # Try loading normalized file first, fallback to loading and normalizing from sources
        normalized_file = self.data_service.normalized_dir / "finflow_events.json"
        if normalized_file.exists():
            import json
            with open(normalized_file, "r", encoding="utf-8") as f:
                raw_list = json.load(f)
            events = [NormalizedEvent(**r) for r in raw_list]
            logger.info("Loaded %d events from normalized JSON cache.", len(events))
            return events

        logger.info("Normalized cache missing, generating from source files...")
        return self.data_service.load_and_normalize_all()

    def retain_all_events(
        self,
        events: Optional[List[NormalizedEvent]] = None,
        bank_id: Optional[str] = None,
        ensure_bank: bool = True,
    ) -> Dict[str, Any]:
        """Retain all FinFlow events into Hindsight preserving source authenticity.

        Note: Records are retained individually to strictly preserve individual
        document_id, exact timestamp, context, metadata, and tags.
        """
        target_bank = bank_id or self.bank_id
        records = events if events is not None else self.load_normalized_records()

        if ensure_bank:
            self.memory_service.ensure_bank_exists(target_bank)

        logger.info("Beginning Hindsight retention of %d FinFlow records into '%s'...", len(records), target_bank)

        attempted = 0
        succeeded = 0
        failed = 0
        retained_ids: List[str] = []
        errors: List[Dict[str, str]] = []

        for idx, event in enumerate(records, start=1):
            attempted += 1
            try:
                # Construct clean metadata dictionary with string values
                string_metadata: Dict[str, str] = {
                    "source_type": str(event.source_type),
                    "system": str(event.system),
                    "title": str(event.title),
                }
                if event.participants:
                    string_metadata["participants"] = ", ".join(event.participants)

                # Context provides the scope
                context_str = f"{event.source_type.replace('_', ' ').title()}: {event.title}"

                # Retain into Hindsight without pre-summarizing
                doc_id = self.memory_service.retain_memory(
                    content=event.content,
                    context=context_str,
                    document_id=event.id,
                    timestamp=event.parsed_datetime,
                    metadata=string_metadata,
                    tags=[event.source_type, event.system, "finflow"],
                    bank_id=target_bank,
                )

                succeeded += 1
                retained_ids.append(event.id)
                logger.info("[%d/%d] Retained %s into Hindsight bank '%s'", idx, len(records), event.id, target_bank)

            except Exception as exc:
                failed += 1
                error_entry = {"id": event.id, "error": str(exc)}
                errors.append(error_entry)
                logger.error("[%d/%d] Failed to retain %s: %s", idx, len(records), event.id, exc)

        summary = {
            "status": "success" if failed == 0 else "partial_failure" if succeeded > 0 else "failed",
            "bank_id": target_bank,
            "attempted": attempted,
            "succeeded": succeeded,
            "failed": failed,
            "retained_ids": retained_ids,
            "errors": errors,
        }

        logger.info(
            "FinFlow Hindsight retention complete. Succeeded: %d, Failed: %d",
            succeeded,
            failed,
        )
        return summary

    async def aretain_all_events(
        self,
        events: Optional[List[NormalizedEvent]] = None,
        bank_id: Optional[str] = None,
        ensure_bank: bool = True,
    ) -> Dict[str, Any]:
        """Async retain all FinFlow events into Hindsight preserving source authenticity."""
        target_bank = bank_id or self.bank_id
        records = events if events is not None else self.load_normalized_records()

        if ensure_bank:
            await self.memory_service.aensure_bank_exists(target_bank)

        logger.info("Beginning async Hindsight retention of %d records into '%s'...", len(records), target_bank)

        attempted = 0
        succeeded = 0
        failed = 0
        retained_ids: List[str] = []
        errors: List[Dict[str, str]] = []

        for idx, event in enumerate(records, start=1):
            attempted += 1
            try:
                string_metadata: Dict[str, str] = {
                    "source_type": str(event.source_type),
                    "system": str(event.system),
                    "title": str(event.title),
                }
                if event.participants:
                    string_metadata["participants"] = ", ".join(event.participants)

                context_str = f"{event.source_type.replace('_', ' ').title()}: {event.title}"

                await self.memory_service.aretain_memory(
                    content=event.content,
                    context=context_str,
                    document_id=event.id,
                    timestamp=event.parsed_datetime,
                    metadata=string_metadata,
                    tags=[event.source_type, event.system, "finflow"],
                    bank_id=target_bank,
                )

                succeeded += 1
                retained_ids.append(event.id)
                logger.info("[%d/%d] Async retained %s into Hindsight bank '%s'", idx, len(records), event.id, target_bank)

            except Exception as exc:
                failed += 1
                error_entry = {"id": event.id, "error": str(exc)}
                errors.append(error_entry)
                logger.error("[%d/%d] Failed to async retain %s: %s", idx, len(records), event.id, exc)

        summary = {
            "status": "success" if failed == 0 else "partial_failure" if succeeded > 0 else "failed",
            "bank_id": target_bank,
            "attempted": attempted,
            "succeeded": succeeded,
            "failed": failed,
            "retained_ids": retained_ids,
            "errors": errors,
        }

        logger.info(
            "Async FinFlow retention complete. Succeeded: %d, Failed: %d",
            succeeded,
            failed,
        )
        return summary
