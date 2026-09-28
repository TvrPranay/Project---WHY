"""Memory endpoints for Hindsight retention and recall operations."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.memory.finflow_memory_ingestion import FinFlowMemoryIngestionService
from app.memory.hindsight import HindsightMemoryService
from app.schemas.decision import EvidenceItem

router = APIRouter(prefix="/memory", tags=["Hindsight Memory"])


class IngestResponse(BaseModel):
    """Response schema for memory ingestion endpoint."""

    status: str = Field(..., description="Overall ingestion status (success, partial_failure, failed).")
    bank_id: str = Field(..., description="Target Hindsight memory bank.")
    attempted: int = Field(..., description="Number of records attempted.")
    succeeded: int = Field(..., description="Number of records successfully retained.")
    failed: int = Field(..., description="Number of records that failed retention.")
    retained_ids: List[str] = Field(default_factory=list, description="List of retained record IDs.")
    errors: List[Dict[str, str]] = Field(default_factory=list, description="Error messages for failed records.")


class RecallResponseSchema(BaseModel):
    """Response schema for testing real Hindsight memory recall."""

    query: str = Field(..., description="Query submitted to Hindsight.")
    bank_id: str = Field(..., description="Memory bank searched.")
    total_recalled: int = Field(..., description="Number of memories returned by Hindsight.")
    memories: List[EvidenceItem] = Field(..., description="Memories retrieved from Hindsight.")


def get_memory_service(settings: Settings = Depends(get_settings)) -> HindsightMemoryService:
    """Dependency providing HindsightMemoryService."""
    return HindsightMemoryService(settings=settings)


def get_ingestion_service(
    memory_service: HindsightMemoryService = Depends(get_memory_service),
    settings: Settings = Depends(get_settings),
) -> FinFlowMemoryIngestionService:
    """Dependency providing FinFlowMemoryIngestionService."""
    return FinFlowMemoryIngestionService(memory_service=memory_service, settings=settings)


@router.post(
    "/ingest",
    response_model=IngestResponse,
    status_code=status.HTTP_200_OK,
    summary="Ingest FinFlow organizational dataset into Hindsight",
    description="Retains all 18 normalized FinFlow records into the configured Hindsight bank.",
)
async def ingest_to_hindsight(
    bank_id: Optional[str] = Query(default=None, description="Optional override bank ID."),
    ingestion_service: FinFlowMemoryIngestionService = Depends(get_ingestion_service),
) -> IngestResponse:
    """Retain FinFlow dataset into Hindsight."""
    try:
        summary = await ingestion_service.aretain_all_events(bank_id=bank_id)
        return IngestResponse(**summary)
    except Exception as exc:
        logger.error("Failed to execute Hindsight ingestion: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Hindsight ingestion failed: {str(exc)}",
        )


@router.get(
    "/recall",
    response_model=RecallResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Recall organizational memories from Hindsight",
    description="Queries the configured Hindsight bank and returns memories with source provenance.",
)
async def recall_from_hindsight(
    q: str = Query(..., description="Natural language query for Hindsight memory recall."),
    bank_id: Optional[str] = Query(default=None, description="Optional override bank ID."),
    limit: int = Query(default=10, ge=1, le=50, description="Max memories to return."),
    memory_service: HindsightMemoryService = Depends(get_memory_service),
    settings: Settings = Depends(get_settings),
) -> RecallResponseSchema:
    """Recall memories from Hindsight."""
    target_bank = bank_id or settings.HINDSIGHT_BANK_ID
    try:
        evidence_items = await memory_service.arecall_memories(
            query=q,
            bank_id=target_bank,
            limit=limit,
        )
        return RecallResponseSchema(
            query=q,
            bank_id=target_bank,
            total_recalled=len(evidence_items),
            memories=evidence_items,
        )
    except Exception as exc:
        logger.error("Hindsight recall error for query '%s': %s", q, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Hindsight recall error: {str(exc)}",
        )
