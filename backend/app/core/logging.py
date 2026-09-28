"""Logging configuration for the WHY backend application."""

import logging
import sys
from typing import Optional


def setup_logging(log_level: Optional[str] = None) -> logging.Logger:
    """Configure structured console logging for the application."""
    level = getattr(logging, (log_level or "INFO").upper(), logging.INFO)

    log_format = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=level,
        format=log_format,
        datefmt=date_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    logger = logging.getLogger("why")
    logger.setLevel(level)
    return logger


logger = setup_logging()
