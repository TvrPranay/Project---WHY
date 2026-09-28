"""Ingestion package."""
from app.ingestion.base import BaseIngestionService
from app.ingestion.synthetic import SyntheticDataIngestionService

__all__ = ["BaseIngestionService", "SyntheticDataIngestionService"]
