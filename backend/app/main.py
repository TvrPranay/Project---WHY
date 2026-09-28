"""FastAPI application entrypoint for WHY - Organizational Decision Memory."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.api.v1.health import router as health_router
from app.core.config import get_settings
from app.core.logging import logger, setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for startup and shutdown events."""
    settings = get_settings()
    setup_logging(log_level="DEBUG" if settings.DEBUG else "INFO")
    logger.info("==================================================")
    logger.info("Starting %s API v%s [%s]", settings.PROJECT_NAME, settings.VERSION, settings.ENVIRONMENT)
    logger.info("Persistent Memory Layer: Hindsight (bank: %s)", settings.HINDSIGHT_BANK_ID)
    logger.info("LLM Provider: %s (model: %s)", settings.LLM_PROVIDER, settings.LLM_MODEL)
    logger.info("==================================================")
    yield
    logger.info("Shutting down %s API", settings.PROJECT_NAME)


def create_application() -> FastAPI:
    """Application factory for FastAPI."""
    settings = get_settings()

    app = FastAPI(
        title=f"{settings.PROJECT_NAME} - Organizational Decision Memory",
        description="An AI agent that remembers why organizational decisions were made and detects when those reasons may no longer be valid.",
        version=settings.VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS if not settings.DEBUG else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API routers
    # Primary health check: GET /api/health
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    # Convenience root health check: GET /health
    app.include_router(health_router, prefix="")

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
