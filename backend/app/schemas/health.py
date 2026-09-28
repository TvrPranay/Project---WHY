"""Health check response schema."""

from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import BaseModel, Field


class HindsightHealthStatus(BaseModel):
    """Health and connectivity status of the Hindsight memory layer."""

    configured: bool = Field(
        ...,
        description="Whether Hindsight configuration is present.",
    )
    reachable: bool = Field(
        ...,
        description="Whether the Hindsight instance is reachable via health probe.",
    )
    base_url: str = Field(
        ...,
        description="Configured Hindsight base URL.",
    )
    bank_id: str = Field(
        ...,
        description="Configured Hindsight memory bank identifier.",
    )
    details: Optional[str] = Field(
        default=None,
        description="Additional diagnostic status or error message if unreachable.",
    )


class HealthResponse(BaseModel):
    """Schema for service health status."""

    status: Literal["ok", "degraded", "down"] = Field(
        default="ok",
        description="Current health status of the service.",
        examples=["ok"],
    )
    app_name: str = Field(
        default="WHY",
        description="Name of the application.",
        examples=["WHY"],
    )
    version: str = Field(
        default="0.1.0",
        description="Current API version.",
        examples=["0.1.0"],
    )
    environment: str = Field(
        default="development",
        description="Active application runtime environment.",
        examples=["development"],
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of the health check.",
    )
    hindsight: Optional[HindsightHealthStatus] = Field(
        default=None,
        description="Operational status of the Hindsight persistent memory layer.",
    )
