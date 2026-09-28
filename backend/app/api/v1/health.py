"""Health check endpoint with Hindsight memory layer connectivity probe."""

from fastapi import APIRouter, Depends, status
from app.core.config import Settings, get_settings
from app.memory.hindsight import HindsightMemoryService
from app.schemas.health import HealthResponse, HindsightHealthStatus

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Returns current service status and runtime environment metadata.",
)
async def get_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Service health check endpoint with Hindsight probe."""
    memory_service = HindsightMemoryService(settings=settings)
    probe_result = memory_service.check_connection()

    hindsight_status = HindsightHealthStatus(
        configured=probe_result.get("configured", False),
        reachable=probe_result.get("reachable", False),
        base_url=probe_result.get("base_url", settings.HINDSIGHT_BASE_URL),
        bank_id=probe_result.get("bank_id", settings.HINDSIGHT_BANK_ID),
        details=probe_result.get("details"),
    )

    return HealthResponse(
        status="ok",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        hindsight=hindsight_status,
    )
