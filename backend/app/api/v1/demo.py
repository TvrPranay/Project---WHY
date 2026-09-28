"""API Router for Controlled Demo Operations."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.schemas.decision import (
    MemoryComparisonRequest,
    MemoryComparisonResponse,
)
from app.services.decision_memory_service import DecisionMemoryService
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import get_llm_service
from app.services.memory_comparison_service import MemoryComparisonService
from app.memory.hindsight import HindsightMemoryService

router = APIRouter(tags=["demo"])


def get_memory_comparison_service(
    settings: Settings = Depends(get_settings),
) -> MemoryComparisonService:
    """Dependency provider for MemoryComparisonService."""
    memory_service = HindsightMemoryService(settings=settings)
    llm_service = get_llm_service(settings=settings)
    decision_memory_service = DecisionMemoryService(memory_service=memory_service, settings=settings)
    reconstruction_service = DecisionReconstructionService(
        memory_service=memory_service,
        llm_service=llm_service,
        decision_memory_service=decision_memory_service,
        settings=settings,
    )
    return MemoryComparisonService(
        reconstruction_service=reconstruction_service,
        settings=settings,
    )


@router.post(
    "/memory-comparison",
    response_model=MemoryComparisonResponse,
    summary="Execute controlled before/after memory demonstration.",
    description="Runs decision investigation under both 'none' and 'hindsight' memory modes independently.",
)
async def memory_comparison(
    request: MemoryComparisonRequest,
    service: MemoryComparisonService = Depends(get_memory_comparison_service),
) -> MemoryComparisonResponse:
    """Execute controlled comparison demonstrating the necessity of Hindsight memory."""
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'question' field cannot be empty.",
        )

    try:
        response = await service.run_comparison(
            question=request.question,
            bank_id=request.bank_id,
            limit=request.limit,
        )
        return response
    except ValueError as exc:
        logger.error("Validation error in memory comparison: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Unexpected error in memory comparison: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred during memory comparison: {str(exc)}",
        )
