#!/usr/bin/env python3
"""Build and Validate FinFlow Synthetic Dataset CLI Script.

Validates the raw FinFlow organizational source files, normalizes all records,
persists the output to data/normalized/finflow_events.json, and prints a formatted
validation summary.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path so app packages can be imported directly
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.ingestion.synthetic import SyntheticDataIngestionService


def main() -> int:
    """Run validation and normalization pipeline."""
    try:
        service = SyntheticDataIngestionService(base_data_dir=PROJECT_ROOT / "data")
        
        # Load, validate, and normalize
        events = service.load_and_normalize_all()
        summary = service.validate_dataset(events)
        output_file = service.save_normalized_dataset(events)

        # Extract counts
        slack_count = summary.by_source_type.get("slack", 0)
        jira_count = summary.by_source_type.get("jira", 0)
        pr_count = summary.by_source_type.get("pull_request", 0)
        incidents_count = summary.by_source_type.get("incident", 0)
        arch_count = summary.by_source_type.get("architecture_note", 0)

        # Format dates (extract YYYY-MM-DD)
        start_date = summary.earliest_timestamp[:10] if summary.earliest_timestamp else "N/A"
        end_date = summary.latest_timestamp[:10] if summary.latest_timestamp else "N/A"

        print("FinFlow Dataset Validation")
        print("--------------------------")
        print(f"Slack conversations: {slack_count}")
        print(f"Jira tickets: {jira_count}")
        print(f"Pull requests: {pr_count}")
        print(f"Incidents: {incidents_count}")
        print(f"Architecture notes: {arch_count}")
        print(f"Total records: {summary.total_records}")
        print()
        print(f"Date range: {start_date} → {end_date}")
        print(f"Unique participants: {summary.unique_participants_count}")
        print(f"Output saved to: {output_file.relative_to(PROJECT_ROOT)}")
        print()

        # Strict validation checks
        if summary.total_records != 18:
            print(f"Validation: FAILED (Expected 18 records, found {summary.total_records})")
            return 1

        if (
            slack_count != 5
            or jira_count != 4
            or pr_count != 3
            or incidents_count != 3
            or arch_count != 3
        ):
            print("Validation: FAILED (Source type distribution mismatch)")
            return 1

        print("Validation: PASSED")
        return 0

    except Exception as exc:
        print(f"Validation: FAILED with error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
