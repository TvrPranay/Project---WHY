"""Phase 8: Controlled Before/After Memory Demonstration CLI.

Executes a live before/after comparison against Hindsight Cloud:
- Mode A (None): Bypasses memory recall, honestly returns INSUFFICIENT EVIDENCE.
- Mode B (Hindsight): Recalls persistent organizational evidence from Hindsight Cloud,
                      reconstructing the decision with verified citations.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.core.config import get_settings
from app.memory.hindsight import HindsightMemoryService
from app.schemas.decision import MemoryComparisonResponse
from app.services.decision_memory_service import DecisionMemoryService
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import get_llm_service
from app.services.memory_comparison_service import MemoryComparisonService


async def main() -> None:
    print("=" * 75)
    print("WHY — PHASE 8: CONTROLLED BEFORE/AFTER MEMORY DEMONSTRATION")
    print("=" * 75)

    settings = get_settings()
    print(f"Target Memory Bank: {settings.HINDSIGHT_BANK_ID}")
    print(f"Hindsight Endpoint: {settings.HINDSIGHT_BASE_URL}")

    memory_service = HindsightMemoryService(settings=settings)
    conn_check = memory_service.check_connection()
    if not conn_check.get("reachable"):
        print(f"\n[ERROR] Unable to reach Hindsight Cloud: {conn_check.get('details')}")
        return

    print(f"[OK] {conn_check.get('details')}\n")

    # Wire services
    llm_service = get_llm_service(settings=settings)
    decision_memory_service = DecisionMemoryService(
        memory_service=memory_service,
        settings=settings,
    )
    reconstruction_service = DecisionReconstructionService(
        memory_service=memory_service,
        llm_service=llm_service,
        decision_memory_service=decision_memory_service,
        settings=settings,
    )
    comparison_service = MemoryComparisonService(
        reconstruction_service=reconstruction_service,
        settings=settings,
    )

    question = "Why did FinFlow choose Provider X for European card payments?"
    print(f"Question under investigation:\n\"{question}\"\n")
    print("Executing controlled comparison (Mode 'none' vs Mode 'hindsight')...\n")

    try:
        response: MemoryComparisonResponse = await comparison_service.run_comparison(
            question=question,
        )

        # -------------------------------------------------------------
        # PANEL 1: WITHOUT HINDSIGHT
        # -------------------------------------------------------------
        print("-" * 75)
        print("PANEL 1: WITHOUT MEMORY (memory_mode='none')")
        print("-" * 75)
        print(f"Status:                     {response.without_memory.status}")
        print(f"Evidence Recalled:          {response.without_memory.evidence_count} records")
        print(f"Prior Investigations:       {response.without_memory.prior_investigations_count} memories")
        print(f"Verified Citations:         {response.without_memory.citation_count}")
        print(f"Decision:                   {response.without_memory.explanation.decision}")
        print(f"Summary:                    {response.without_memory.explanation.summary}")
        print(f"Confidence:                 {response.without_memory.explanation.confidence:.2f}")

        # Assert no memory leaked into mode 'none'
        assert response.without_memory.evidence_count == 0, "No-memory mode should recall 0 evidence"
        assert response.without_memory.citation_count == 0, "No-memory mode should have 0 citations"
        assert "INSUFFICIENT" in response.without_memory.status.upper(), "Status should be INSUFFICIENT EVIDENCE"

        # -------------------------------------------------------------
        # PANEL 2: WITH HINDSIGHT
        # -------------------------------------------------------------
        print("\n" + "-" * 75)
        print("PANEL 2: WITH HINDSIGHT (memory_mode='hindsight')")
        print("-" * 75)
        print(f"Status:                     {response.with_hindsight.status}")
        print(f"Memory Bank:                {response.with_hindsight.bank_id}")
        print(f"Primary Evidence Recalled:  {response.with_hindsight.evidence_count} records")
        print(f"Prior Investigations:       {response.with_hindsight.prior_investigations_count} memories")
        print(f"Verified Citations:         {response.with_hindsight.citation_count} cited documents")
        print(f"Decision:                   {response.with_hindsight.explanation.decision}")
        print(f"Summary:                    {response.with_hindsight.explanation.summary}")
        print(f"Confidence:                 {response.with_hindsight.explanation.confidence:.2f}")

        print("\nReconstructed Reasons:")
        for idx, r in enumerate(response.with_hindsight.explanation.reasons, start=1):
            cites = f" (Citations: {', '.join(r.evidence_ids)})" if r.evidence_ids else ""
            print(f"  {idx}. {r.reason}{cites}")

        print("\nAlternatives Considered:")
        for alt in response.with_hindsight.explanation.alternatives:
            print(f"  • {alt.name}: {alt.reason_not_selected}")

        assert response.with_hindsight.evidence_count > 0, "Hindsight mode should recall evidence"
        assert response.with_hindsight.citation_count > 0, "Hindsight mode should have citations"

        # -------------------------------------------------------------
        # SUMMARY EVALUATION
        # -------------------------------------------------------------
        print("\n" + "=" * 75)
        print("[VERIFIED] Controlled Before/After Demonstration Succeeded!")
        print("1. Without Hindsight: The system truthfully reports INSUFFICIENT EVIDENCE.")
        print(f"2. With Hindsight: Recalls {response.with_hindsight.evidence_count} organizational records and reconstructs the decision.")
        print(f"3. Compounding Memory: {response.with_hindsight.prior_investigations_count} prior WHY investigation memories recalled.")
        print("=" * 75)

    except Exception as exc:
        print(f"\n[ERROR] Comparison execution failed: {exc}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
