"""Pytest test fixtures and configuration."""

import pytest
from fastapi.testclient import TestClient
from app.core.config import Settings, get_settings
from app.main import create_application


@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """Fixture providing test-specific settings."""
    return Settings(
        ENVIRONMENT="test",
        DEBUG=True,
        PROJECT_NAME="WHY-Test",
        VERSION="0.1.0-test",
        HINDSIGHT_API_KEY="test-hindsight-key",
        HINDSIGHT_BASE_URL="https://api.test-hindsight.ai",
        HINDSIGHT_BANK_ID="test-bank",
        LLM_PROVIDER="groq",
        GROQ_API_KEY="test-groq-key",
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db",
    )


@pytest.fixture
def client(test_settings: Settings) -> TestClient:
    """Fixture providing a FastAPI TestClient configured for testing."""
    app = create_application()
    app.dependency_overrides[get_settings] = lambda: test_settings
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
