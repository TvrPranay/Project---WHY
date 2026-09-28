"""Abstract Base and Placeholder for Data Ingestion Service."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.memory.hindsight import HindsightMemoryService


class BaseIngestionService(ABC):
    """Abstract interface for ingesting organizational documents into Hindsight."""

    @abstractmethod
    async def ingest_batch(
        self,
        source_type: str,
        records: List[Dict[str, Any]],
    ) -> int:
        """Process and store a batch of synthetic organizational records."""
        pass


class SyntheticDataIngestionService(BaseIngestionService):
    """Placeholder service for ingesting synthetic FinFlow data into Hindsight."""

    def __init__(
        self,
        memory_service: Optional[HindsightMemoryService] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.memory_service = memory_service or HindsightMemoryService(self.settings)
        logger.info("Initialized SyntheticDataIngestionService placeholder.")

    async def ingest_batch(
        self,
        source_type: str,
        records: List[Dict[str, Any]],
    ) -> int:
        """Placeholder batch ingestion.

        Phase 1 placeholder: Synthetic dataset parser and Hindsight retention pipeline
        will be connected in Phase 2.
        """
        logger.info(
            "SyntheticDataIngestionService.ingest_batch called for source '%s' with %d records (placeholder mode).",
            source_type,
            len(records),
        )
        return len(records)
