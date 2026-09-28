"""Pydantic schemas for normalized organizational events."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


SourceType = Literal[
    "slack",
    "jira",
    "pull_request",
    "incident",
    "architecture_note",
]


class NormalizedEvent(BaseModel):
    """Common internal representation for all organizational memory records."""

    id: str = Field(
        ...,
        description="Unique identifier for the record (e.g. SLACK-001, PAY-1042, PR-412).",
    )
    source_type: str = Field(
        ...,
        description="Origin source type (slack, jira, pull_request, incident, architecture_note).",
    )
    title: str = Field(
        ...,
        description="Descriptive title or subject of the record.",
    )
    timestamp: str = Field(
        ...,
        description="ISO 8601 formatted timestamp string.",
    )
    participants: List[str] = Field(
        default_factory=list,
        description="List of authors, assignees, commenters, or meeting attendees.",
    )
    system: str = Field(
        ...,
        description="Primary software system or business component related to the event.",
    )
    content: str = Field(
        ...,
        description="Verbatim or extracted textual body of the communication/artifact.",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Source-specific metadata preserved without loss.",
    )

    @field_validator("timestamp")
    @classmethod
    def validate_timestamp_format(cls, v: str) -> str:
        """Validate that the timestamp is a valid ISO 8601 string."""
        try:
            # Replaces Z with +00:00 for fromisoformat compatibility in Python 3.10/3.11
            cleaned = v.replace("Z", "+00:00")
            datetime.fromisoformat(cleaned)
        except Exception as e:
            raise ValueError(f"Invalid ISO 8601 timestamp: '{v}'. Error: {e}")
        return v

    @property
    def parsed_datetime(self) -> datetime:
        """Return python datetime object."""
        return datetime.fromisoformat(self.timestamp.replace("Z", "+00:00"))


class DatasetValidationSummary(BaseModel):
    """Summary statistics for FinFlow dataset validation."""

    total_records: int
    by_source_type: Dict[str, int]
    earliest_timestamp: str
    latest_timestamp: str
    unique_participants_count: int
    is_valid: bool
