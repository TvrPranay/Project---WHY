#!/usr/bin/env python3
"""WHY — Decision Invalidation Assessment CLI Demo Script.

Assesses whether the original reasoning behind a historical decision remains
supported by later organizational evidence retrieved from Hindsight persistent memory.
"""

import asyncio
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
from app.services.decision_invalidation import DecisionInvalidationService
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import get_llm_service


async def async_main() -> int:
    """Run decision assessment pipeline."""
    settings = get_settings()

    default_question = "Why did FinFlow choose Provider X for European card payments?"
    question = sys.argv[1] if len(sys.argv) > 1 else default_question

    memory_service = HindsightMemoryService(settings=settings)
    llm_service = get_llm_service(settings=settings)
    reconstruction_service = DecisionReconstructionService(
        memory_service=memory_service,
        llm_service=llm_service,
        settings=settings,
    )
    invalidation_service = DecisionInvalidationService(
        memory_service=memory_service,
        reconstruction_service=reconstruction_service,
        llm_service=llm_service,
        settings=settings,
    )

    print("----------------------------------------")
    print("WHY — Decision Invalidation Engine")
    print("----------------------------------------")
    print(f"Hindsight URL: {settings.HINDSIGHT_BASE_URL}")
    print(f"Target Bank:   {settings.HINDSIGHT_BANK_ID}")
    print(f"LLM Provider:  {settings.LLM_PROVIDER} ({settings.LLM_MODEL})")
    print()
    print("Question:")
    print(f"  {question}")
    print()

    # Pre-check Hindsight connectivity
    probe = memory_service.check_connection()
    if not probe["reachable"]:
        print(f"ERROR: Cannot connect to Hindsight at {settings.HINDSIGHT_BASE_URL}", file=sys.stderr)
        print(f"Details: {probe.get('details')}", file=sys.stderr)
        return 1

    try:
        assessment = await invalidation_service.assess_decision(
            question=question,
            bank_id=settings.HINDSIGHT_BANK_ID,
            limit=15,
        )
    except Exception as exc:
        print(f"ERROR during decision assessment: {exc}", file=sys.stderr)
        return 1

    print("========================================")
    print("WHY — DECISION ASSESSMENT")
    print("========================================")
    print()

    print("DECISION")
    print(assessment.decision)
    print()

    print("ORIGINAL REASONING")
    if assessment.original_reasons:
        for idx, r in enumerate(assessment.original_reasons, start=1):
            citations = f" [Evidence: {', '.join(r.evidence_ids)}]" if r.evidence_ids else ""
            print(f"{idx}. {r.reason}{citations}")
    else:
        print("  (None identified)")
    print()

    print("NEW EVIDENCE")
    if assessment.new_evidence:
        for mem in assessment.new_evidence[:5]:
            ref = mem.external_url or mem.title
            print(f"- {ref}: {mem.title}")
    else:
        print("  (No later evidence detected)")
    print()

    print("REASON ASSESSMENT")
    if assessment.affected_reasons:
        for ar in assessment.affected_reasons:
            print(f"[{ar.impact}] {ar.current_support}")
            print(f"Original: {ar.original_reason}")
            print(f"→ {ar.assessment}")
            if ar.new_evidence_ids:
                print(f"  New Evidence Citations: {', '.join(ar.new_evidence_ids)}")
            print()
    else:
        print("  (All original reasons remain supported without changes)")
        print()

    print("OVERALL STATUS")
    status_icon = "⚠" if assessment.status.value in ("REVIEW REQUIRED", "STALE", "CONFLICTED") else "✓"
    print(f"{status_icon} {assessment.status.value}")
    print()

    print("WHY")
    print(assessment.impact_summary)
    print()

    if assessment.changed_assumptions:
        print("CHANGED ASSUMPTIONS")
        for ca in assessment.changed_assumptions:
            print(f"- {ca}")
        print()

    print("CONFIDENCE")
    print(f"{assessment.confidence:.2f}")
    if assessment.confidence_rationale:
        print(f"Rationale: {assessment.confidence_rationale}")
    print()

    print("EVIDENCE SOURCES")
    for doc in sorted(assessment.source_documents):
        print(f"- {doc}")
    print()
    print("========================================")
    return 0


def main() -> int:
    return asyncio.run(async_main())


if __name__ == "__main__":
    sys.exit(main())
