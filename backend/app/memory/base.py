"""Abstract Base Interface for Organizational Memory.

Hindsight is the central long-term memory layer of WHY.
All memory implementations must adhere to this interface contract.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional
from app.schemas.decision import EvidenceItem


class BaseMemoryService(ABC):
    """Abstract interface defining the organizational memory service contract."""

    @abstractmethod
    def check_connection(self) -> Dict[str, Any]:
        """Verify connectivity to the memory service."""
        pass

    @abstractmethod
    def ensure_bank_exists(self, bank_id: Optional[str] = None) -> bool:
        """Verify that the target memory bank exists, creating it if necessary."""
        pass

    @abstractmethod
    def retain_memory(
        self,
        content: str,
        context: Optional[str] = None,
        document_id: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
        bank_id: Optional[str] = None,
    ) -> str:
        """Store a document or signal in persistent organizational memory.

        Args:
            content: Raw text content from Slack, Jira, PR, ADR, incident report.
            context: Descriptive scope or context (e.g. 'slack: Discussion').
            document_id: Unique identifier for the source record (e.g. 'SLACK-001').
            timestamp: Historical timestamp when event occurred.
            metadata: Key-value string attributes preserved for source tracking.
            tags: Descriptive tags for category filtering.
            bank_id: Target memory bank ID.

        Returns:
            Confirmation or document identifier from the memory engine.
        """
        pass

    @abstractmethod
    def recall_memories(
        self,
        query: str,
        bank_id: Optional[str] = None,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[EvidenceItem]:
        """Recall relevant historical memories and evidence from organizational memory.

        Args:
            query: Natural language query or decision subject.
            bank_id: Target memory bank ID.
            limit: Maximum number of evidence items to return.
            filters: Optional filters.

        Returns:
            List of evidence items with provenance and context.
        """
        pass

    @abstractmethod
    def check_conflicts_or_staleness(
        self,
        new_signal: str,
        decision_id: str,
        bank_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Compare new organizational information against past persistent memory

        to detect contradictory or stale assumptions.
        """
        pass
