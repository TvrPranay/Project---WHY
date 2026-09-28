"""Application configuration management using Pydantic Settings."""

from functools import lru_cache
from pathlib import Path
from typing import List, Literal, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Core application settings loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(
        env_file=[str(Path(__file__).resolve().parent.parent.parent / ".env"), ".env"],
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Application settings
    PROJECT_NAME: str = "WHY"
    VERSION: str = "0.1.0"
    ENVIRONMENT: Literal["development", "staging", "production", "test"] = "development"
    DEBUG: bool = True

    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_V1_PREFIX: str = "/api"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Hindsight Memory Layer Configuration
    # Hindsight is the central long-term organizational memory layer.
    HINDSIGHT_API_KEY: Optional[str] = Field(
        default=None,
        description="API key for Hindsight persistent memory service (optional for local/unauthenticated instances).",
    )
    HINDSIGHT_BASE_URL: str = Field(
        default="http://localhost:8888",
        description="Base URL for Hindsight API (supports local or cloud instance).",
    )
    HINDSIGHT_BANK_ID: str = Field(
        default="finflow-why",
        description="Target memory bank or namespace in Hindsight.",
    )

    # LLM Provider Configuration
    LLM_PROVIDER: Literal["groq", "openai", "anthropic", "mock"] = Field(
        default="groq",
        description="LLM provider name (Groq is the primary provider for the hackathon).",
    )
    GROQ_API_KEY: Optional[str] = Field(
        default=None,
        description="API key for Groq LLM inference.",
    )
    LLM_MODEL: str = Field(
        default="llama-3.3-70b-versatile",
        description="Default LLM model identifier.",
    )
    LLM_TEMPERATURE: float = Field(
        default=0.1,
        description="Sampling temperature for LLM generation.",
    )
    LLM_MAX_TOKENS: int = Field(
        default=4096,
        description="Maximum tokens for LLM generation.",
    )

    # Operational Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/why_db",
        description="Relational database connection string for standard operational data.",
    )

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENVIRONMENT == "production"

    @property
    def is_testing(self) -> bool:
        """Check if running in test mode."""
        return self.ENVIRONMENT == "test"


@lru_cache()
def get_settings() -> Settings:
    """Return cached application settings instance."""
    return Settings()
