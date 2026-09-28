#!/usr/bin/env python3
"""Initialize Hindsight Memory Bank CLI Script.

Connects to the configured Hindsight instance, checks whether the target bank exists,
creates it if necessary, verifies the connection, and reports status.
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
    """Run bank initialization."""
    settings = get_settings()
    service = HindsightMemoryService(settings=settings)

    print("----------------------------------------")
    print("WHY — Hindsight Bank Initialization")
    print("----------------------------------------")
    print(f"Hindsight URL: {settings.HINDSIGHT_BASE_URL}")
    print(f"Target Bank:   {settings.HINDSIGHT_BANK_ID}")
    print(f"Auth set:      {'Yes (hidden)' if settings.HINDSIGHT_API_KEY else 'No (unauthenticated/local)'}")
    print()

    # Step 1: Probe connection
    probe = service.check_connection()
    if not probe["reachable"]:
        print(f"Hindsight connection failed: {probe.get('details')}", file=sys.stderr)
        print()
        print("Troubleshooting:", file=sys.stderr)
        print("1. Ensure Hindsight is running on the configured HINDSIGHT_BASE_URL.", file=sys.stderr)
        print("2. For local Docker: docker run -p 8888:8888 ghcr.io/hindsight-memory/hindsight", file=sys.stderr)
        print("3. Check network and firewall settings.", file=sys.stderr)
        return 1

    print("Hindsight server connection: OK")

    # Step 2: Ensure bank exists
    try:
        service.ensure_bank_exists(
            bank_id=settings.HINDSIGHT_BANK_ID,
            name="FinFlow Organizational Decision Memory",
            mission="Memory bank tracking FinFlow engineering decisions, provider evaluations, and architecture rationales.",
        )
        print(f"Hindsight bank '{settings.HINDSIGHT_BANK_ID}' verified / ready.")
        print()
        print("Initialization: PASSED")
        return 0

    except Exception as exc:
        err_str = str(exc)
        if "401" in err_str or "unauthorized" in err_str.lower() or "forbidden" in err_str.lower():
            print("Hindsight authentication failed: Please verify HINDSIGHT_API_KEY.", file=sys.stderr)
        else:
            print(f"Hindsight bank initialization failed: {err_str}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
