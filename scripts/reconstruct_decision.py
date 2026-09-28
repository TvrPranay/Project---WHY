#!/usr/bin/env python3
"""WHY — Decision Reconstruction CLI Demo Script.

Reconstructs why historical decisions were made by querying live Hindsight
persistent memory and reasoning over the evidence package with an LLM.
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
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import get_llm_service


async def async_main() -> int:
    """Run decision reconstruction pipeline."""
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

    print("----------------------------------------")
    print("WHY — Decision Reconstruction Pipeline")
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
        explanation = await reconstruction_service.reconstruct_decision(
            question=question,
            bank_id=settings.HINDSIGHT_BANK_ID,
            limit=15,
        )
    except Exception as exc:
        print(f"ERROR during decision reconstruction: {exc}", file=sys.stderr)
        return 1

    print("========================================")
    print("WHY — DECISION RECONSTRUCTION")
    print("========================================")
    print()
    print("DECISION")
    print(explanation.decision)
    print()

    print("SUMMARY")
    print(explanation.summary)
    print()

    print("WHY")
    if explanation.reasons:
        for idx, r in enumerate(explanation.reasons, start=1):
            citations = f" [Evidence: {', '.join(r.evidence_ids)}]" if r.evidence_ids else ""
            print(f"{idx}. {r.reason}{citations}")
    else:
        print("  (No specific rationale points identified)")
    print()

    print("ALTERNATIVES")
    if explanation.alternatives:
        for alt in explanation.alternatives:
            citations = f" [Evidence: {', '.join(alt.evidence_ids)}]" if alt.evidence_ids else ""
            print(f"- {alt.name} — {alt.reason_not_selected}{citations}")
    else:
        print("  (None identified in evidence)")
    print()

    print("CONSTRAINTS")
    if explanation.constraints:
        for c in explanation.constraints:
            print(f"- {c}")
    else:
        print("  (None specified)")
    print()

    print("PARTICIPANTS")
    if explanation.participants:
        print(f"- {', '.join(explanation.participants)}")
    else:
        print("  (None recorded)")
    print()

    print("DEPENDENCIES")
    if explanation.dependencies:
        for dep in explanation.dependencies:
            print(f"- {dep}")
    else:
        print("  (None recorded)")
    print()

    if explanation.timeframe and (explanation.timeframe.start or explanation.timeframe.end):
        print("TIMEFRAME")
        print(f"Start: {explanation.timeframe.start or 'Unknown'} | End: {explanation.timeframe.end or 'Ongoing'}")
        print()

    if explanation.conflicts:
        print("HISTORICAL CONFLICTS / INCONSISTENCIES")
        for conf in explanation.conflicts:
            print(f"- Topic: {conf.topic}")
            for stmt in conf.statements:
                print(f"  * {stmt}")
            if conf.evidence_ids:
                print(f"  * Sources: {', '.join(conf.evidence_ids)}")
        print()

    print("EVIDENCE")
    if explanation.source_documents:
        for doc in sorted(explanation.source_documents):
            print(f"- {doc}")
    elif explanation.evidence:
        for mem in explanation.evidence:
            ref = mem.external_url or mem.title
            print(f"- {ref}")
    else:
        print("  (No supporting documents)")
    print()

    print("CONFIDENCE")
    print(f"{explanation.confidence:.2f}")
    if explanation.confidence_rationale:
        print(f"Rationale: {explanation.confidence_rationale}")
    print()
    print("========================================")
    return 0


def main() -> int:
    return asyncio.run(async_main())


if __name__ == "__main__":
    sys.exit(main())
