#!/usr/bin/env python3
"""Retain FinFlow Synthetic Dataset into Hindsight CLI Script.

Loads normalized FinFlow records and retains each document into the configured
Hindsight bank with full provenance, timestamps, and metadata.
"""

import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import get_settings
from app.memory.finflow_memory_ingestion import FinFlowMemoryIngestionService
from app.memory.hindsight import HindsightMemoryService


def main() -> int:
    """Run FinFlow retention pipeline."""
    settings = get_settings()
    memory_service = HindsightMemoryService(settings=settings)
    ingestion_service = FinFlowMemoryIngestionService(memory_service=memory_service, settings=settings)

    print("----------------------------------------")
    print("WHY — FinFlow Hindsight Ingestion")
    print("----------------------------------------")
    print(f"Hindsight URL: {settings.HINDSIGHT_BASE_URL}")
    print(f"Bank:          {settings.HINDSIGHT_BANK_ID}")
    print()

    # Pre-check connectivity
    probe = memory_service.check_connection()
    if not probe["reachable"]:
        print(f"ERROR: Cannot connect to Hindsight server at {settings.HINDSIGHT_BASE_URL}", file=sys.stderr)
        print(f"Details: {probe.get('details')}", file=sys.stderr)
        print()
        print("Retention aborted. Please start Hindsight server or check configuration.", file=sys.stderr)
        return 1

    # Load records
    try:
        events = ingestion_service.load_normalized_records()
    except Exception as exc:
        print(f"ERROR loading FinFlow records: {exc}", file=sys.stderr)
        return 1

    total = len(events)
    print(f"Source records discovered: {total}")
    print()
    print("Retaining:")

    # Execute retention
    try:
        summary = ingestion_service.retain_all_events(events=events, ensure_bank=True)
    except Exception as exc:
        print(f"ERROR during retention: {exc}", file=sys.stderr)
        return 1

    print()
    print("Retention complete.")
    print(f"Successfully retained: {summary['succeeded']}")
    print(f"Failed:                {summary['failed']}")
    print()

    if summary["failed"] > 0:
        print("Encountered errors on the following records:", file=sys.stderr)
        for err in summary["errors"]:
            print(f"  - {err['id']}: {err['error']}", file=sys.stderr)
        print()
        print("Hindsight memory ingestion: FAILED (Partial)")
        return 1

    print("Hindsight memory ingestion: PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
