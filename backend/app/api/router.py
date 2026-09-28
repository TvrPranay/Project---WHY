"""Main API router combining all endpoint modules."""

from fastapi import APIRouter
from app.api.v1 import decisions, demo, health, memory

api_router = APIRouter()

# Register health check endpoint (accessible at /api/health)
api_router.include_router(health.router)

# Register Hindsight memory endpoints (accessible at /api/v1/memory/* and /api/memory/*)
api_router.include_router(memory.router, prefix="/v1")
api_router.include_router(memory.router, prefix="")

# Register Decision reconstruction endpoints (accessible at /api/v1/decisions/* and /api/decisions/*)
api_router.include_router(decisions.router, prefix="/v1/decisions")
api_router.include_router(decisions.router, prefix="/decisions")

# Register Demo endpoints (accessible at /api/v1/demo/* and /api/demo/*)
api_router.include_router(demo.router, prefix="/v1/demo")
api_router.include_router(demo.router, prefix="/demo")

