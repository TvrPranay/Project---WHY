"""Unit tests for configuration loading."""

import os
from unittest.mock import patch
from app.core.config import Settings, get_settings


def test_default_configuration():
    """Verify default configuration attributes load with expected types."""
    settings = Settings()
    assert settings.PROJECT_NAME == "WHY"
    assert isinstance(settings.PORT, int) and settings.PORT > 0
    assert settings.LLM_PROVIDER in ["groq", "openai", "anthropic", "mock"]
    assert settings.HINDSIGHT_BANK_ID in ("finflow-why", "finflow-decisions")
    assert isinstance(settings.CORS_ORIGINS, list)
    assert not settings.is_production


def test_environment_override():
    """Verify settings pick up environment variable overrides."""
    with patch.dict(
        os.environ,
        {
            "PROJECT_NAME": "WHY-Custom",
            "ENVIRONMENT": "production",
            "PORT": "9000",
            "HINDSIGHT_BANK_ID": "finflow-prod-bank",
            "LLM_PROVIDER": "groq",
            "GROQ_API_KEY": "gsk_test12345",
        },
    ):
        settings = Settings()
        assert settings.PROJECT_NAME == "WHY-Custom"
        assert settings.ENVIRONMENT == "production"
        assert settings.PORT == 9000
        assert settings.HINDSIGHT_BANK_ID == "finflow-prod-bank"
        assert settings.GROQ_API_KEY == "gsk_test12345"
        assert settings.is_production
        assert not settings.is_testing


def test_cached_settings_singleton():
    """Verify get_settings returns a valid Settings instance."""
    settings_1 = get_settings()
    settings_2 = get_settings()
    assert settings_1 is settings_2
