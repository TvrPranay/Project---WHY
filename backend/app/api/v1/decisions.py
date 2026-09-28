"""API Router for Decision Reconstruction and Invalidation Assessment."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from app.core.logging import logger
from app.schemas.decision import (
    AssessDecisionRequest,
    DecisionAssessment,
    DecisionExplanation,
    DecisionHistoryRequest,
    DecisionHistoryResponse,
    ReconstructDecisionRequest,
    RememberDecisionRequest,
    RememberDecisionResponse,
)
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.decision_invalidation import DecisionInvalidationService
from app.services.decision_memory_service import DecisionMemoryService
from app.services.llm_service import get_llm_service
from app.memory.hindsight import HindsightMemoryService

router = APIRouter(tags=["decisions"])


def get_decision_memory_service(
    settings: Settings = Depends(get_settings),
) -> DecisionMemoryService:
    """Dependency provider for DecisionMemoryService."""
    memory_service = HindsightMemoryService(settings=settings)
    return DecisionMemoryService(memory_service=memory_service, settings=settings)


def get_decision_reconstruction_service(
    settings: Settings = Depends(get_settings),
) -> DecisionReconstructionService:
    """Dependency provider for DecisionReconstructionService."""
    memory_service = HindsightMemoryService(settings=settings)
    llm_service = get_llm_service(settings=settings)
    decision_memory_service = DecisionMemoryService(memory_service=memory_service, settings=settings)
    return DecisionReconstructionService(
        memory_service=memory_service,
        llm_service=llm_service,
        decision_memory_service=decision_memory_service,
        settings=settings,
    )


def get_decision_invalidation_service(
    settings: Settings = Depends(get_settings),
) -> DecisionInvalidationService:
    """Dependency provider for DecisionInvalidationService."""
    memory_service = HindsightMemoryService(settings=settings)
    llm_service = get_llm_service(settings=settings)
    reconstruction_service = DecisionReconstructionService(
        memory_service=memory_service,
        llm_service=llm_service,
        settings=settings,
    )
    return DecisionInvalidationService(
        memory_service=memory_service,
        reconstruction_service=reconstruction_service,
        llm_service=llm_service,
        settings=settings,
    )


@router.post(
    "/reconstruct",
    response_model=DecisionExplanation,
    summary="Reconstruct why an organizational decision was made from Hindsight memory.",
    description="Recalls evidence from Hindsight persistent memory and uses LLM reasoning to reconstruct the historical decision.",
)
async def reconstruct_decision(
    request: ReconstructDecisionRequest,
    service: DecisionReconstructionService = Depends(get_decision_reconstruction_service),
) -> DecisionExplanation:
    """Reconstruct an organizational decision based on historical memories."""
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'question' field cannot be empty.",
        )

    try:
        explanation = await service.reconstruct_decision(
            question=request.question,
            bank_id=request.bank_id,
            limit=request.limit,
            memory_mode=request.memory_mode,
        )
        return explanation
    except TimeoutError as exc:
        logger.error("Decision reconstruction timeout: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Decision reconstruction timed out waiting for upstream services.",
        )
    except ValueError as exc:
        logger.error("Validation error in decision reconstruction: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except RuntimeError as exc:
        err_msg = str(exc)
        logger.error("Upstream service error during decision reconstruction: %s", err_msg)
        clean_detail = "Upstream LLM or Hindsight service encountered an error."
        if "401" in err_msg or "unauthorized" in err_msg.lower():
            clean_detail = "Upstream service authentication failed. Please verify API key configuration."
        elif "rate limit" in err_msg.lower() or "429" in err_msg:
            clean_detail = "Upstream service rate limit reached. Please retry shortly."
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=clean_detail,
        )
    except Exception as exc:
        logger.exception("Unexpected error reconstructing decision: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected internal error occurred during decision reconstruction.",
        )


@router.post(
    "/assess",
    response_model=DecisionAssessment,
    summary="Assess whether original decision reasoning remains valid given later evidence.",
    description="Compares historical reasons with later organizational evidence from Hindsight to determine validity.",
)
async def assess_decision(
    request: AssessDecisionRequest,
    service: DecisionInvalidationService = Depends(get_decision_invalidation_service),
) -> DecisionAssessment:
    """Assess whether a historical decision's rationale requires review."""
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'question' field cannot be empty.",
        )

    try:
        assessment = await service.assess_decision(
            question=request.question,
            bank_id=request.bank_id,
            limit=request.limit,
        )
        return assessment
    except TimeoutError as exc:
        logger.error("Decision assessment timeout: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Decision assessment timed out waiting for upstream services.",
        )
    except ValueError as exc:
        logger.error("Validation error in decision assessment: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except RuntimeError as exc:
        err_msg = str(exc)
        logger.error("Upstream service error during decision assessment: %s", err_msg)
        clean_detail = "Upstream LLM or Hindsight service encountered an error."
        if "401" in err_msg or "unauthorized" in err_msg.lower():
            clean_detail = "Upstream service authentication failed. Please verify API key configuration."
        elif "rate limit" in err_msg.lower() or "429" in err_msg:
            clean_detail = "Upstream service rate limit reached. Please retry shortly."
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=clean_detail,
        )
    except Exception as exc:
        logger.exception("Unexpected error assessing decision: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected internal error occurred during decision assessment.",
        )


@router.post(
    "/remember",
    response_model=RememberDecisionResponse,
    summary="Retain completed decision reasoning and assessment into Hindsight persistent memory.",
    description="Stores the structured semantic investigation outcome into Hindsight for future organizational learning.",
)
async def remember_decision(
    request: RememberDecisionRequest,
    service: DecisionMemoryService = Depends(get_decision_memory_service),
) -> RememberDecisionResponse:
    """Retain the results of a completed decision investigation into Hindsight."""
    if not request.decision or not request.decision.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'decision' field cannot be empty.",
        )

    try:
        response = await service.aretain_investigation(request)
        return response
    except Exception as exc:
        logger.exception("Failed to retain decision reasoning in Hindsight: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retain decision investigation in Hindsight: {str(exc)}",
        )


@router.post(
    "/history",
    response_model=DecisionHistoryResponse,
    summary="Retrieve previous WHY investigation memories from Hindsight.",
    description="Semantically searches Hindsight for prior decision investigation memories.",
)
async def get_decision_history(
    request: DecisionHistoryRequest,
    service: DecisionMemoryService = Depends(get_decision_memory_service),
) -> DecisionHistoryResponse:
    """Recall prior investigation memories related to a decision question."""
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'question' field cannot be empty.",
        )

    try:
        investigations = await service.arecall_previous_investigations(
            question=request.question,
            bank_id=request.bank_id,
            limit=request.limit,
        )
        return DecisionHistoryResponse(
            question=request.question,
            count=len(investigations),
            investigations=investigations,
        )
    except Exception as exc:
        logger.exception("Failed to retrieve decision investigation history from Hindsight: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to recall decision history from Hindsight: {str(exc)}",
        )

