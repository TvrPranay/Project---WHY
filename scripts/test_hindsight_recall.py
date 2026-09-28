#!/usr/bin/env python3
"""Test Real Hindsight Recall CLI Script.

Executes a live memory recall query against the configured Hindsight bank
and prints verbatim memories, types, and document citations returned by Hindsight.
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
from app.memory.hindsight import HindsightMemoryService


def main() -> int:
    """Run real recall test."""
    settings = get_settings()
    service = HindsightMemoryService(settings=settings)

    default_query = "Why did FinFlow choose Provider X for European card payments?"
    query = sys.argv[1] if len(sys.argv) > 1 else default_query

    print("----------------------------------------")
    print("WHY — Hindsight Recall Test")
    print("----------------------------------------")
    print(f"Hindsight URL: {settings.HINDSIGHT_BASE_URL}")
    print(f"Bank:          {settings.HINDSIGHT_BANK_ID}")
    print()
    print("Query:")
    print(f"  {query}")
    print()

    # Pre-check connectivity
    probe = service.check_connection()
    if not probe["reachable"]:
        print(f"ERROR: Cannot connect to Hindsight server at {settings.HINDSIGHT_BASE_URL}", file=sys.stderr)
        print(f"Details: {probe.get('details')}", file=sys.stderr)
        print()
        print("Recall aborted. Please start Hindsight server or check configuration.", file=sys.stderr)
        return 1

    try:
        memories = service.recall_memories(
            query=query,
            bank_id=settings.HINDSIGHT_BANK_ID,
            limit=5,
        )
    except Exception as exc:
        print(f"ERROR during recall: {exc}", file=sys.stderr)
        return 1

    print(f"Retrieved memories count: {len(memories)}")
    print()

    if not memories:
        print("No memories found. Has the FinFlow dataset been retained into this bank yet?")
        print("Run: python scripts/retain_finflow.py")
        print()
        return 0

    print("Retrieved memories:")
    for idx, mem in enumerate(memories, start=1):
        print(f"{idx}. {mem.content}")
        print()

    print("Memory types:")
    types = {mem.source_type for mem in memories}
    for t in sorted(types):
        print(f"  - {t}")
    print()

    print("Sources/documents:")
    docs = {mem.external_url for mem in memories if mem.external_url}
    for doc in sorted(docs):
        print(f"  - {doc}")
    print()

    print("Recall completed successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
