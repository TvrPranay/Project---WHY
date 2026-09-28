"""Phase 7: Test Hindsight Memory Evolution & Learning Loop.

Demonstrates that WHY can retain a completed investigation into Hindsight Cloud
and semantically recall it during subsequent investigations.
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
from app.schemas.decision import DecisionReason, DecisionStatus, RememberDecisionRequest
from app.services.decision_memory_service import DecisionMemoryService


async def main() -> None:
    print("=" * 70)
    print("WHY — PHASE 7: HINDSIGHT MEMORY EVOLUTION & LEARNING PROOF")
    print("=" * 70)

    settings = get_settings()
    print(f"Target Hindsight Bank: {settings.HINDSIGHT_BANK_ID}")
    print(f"Hindsight Base URL:    {settings.HINDSIGHT_BASE_URL}")

    memory_service = HindsightMemoryService(settings=settings)
    conn_check = memory_service.check_connection()
    if not conn_check.get("reachable"):
        print(f"\n[ERROR] Unable to reach Hindsight Cloud: {conn_check.get('details')}")
        print("Please verify HINDSIGHT_BASE_URL and HINDSIGHT_API_KEY in backend/.env")
        return

    print(f"[OK] {conn_check.get('details')}\n")

    decision_memory_service = DecisionMemoryService(
        memory_service=memory_service,
        settings=settings,
    )

    # 1. Prepare sample completed investigation memory
    print("STEP 1: Retaining completed decision investigation in Hindsight...")
    sample_request = RememberDecisionRequest(
        question="Why did FinFlow choose Provider X for European card payments?",
        decision="FinFlow selected Provider X for European acquired card payments.",
        status=DecisionStatus.REVIEW_REQUIRED,
        reasons=[
            DecisionReason(
                reason="Direct acquiring compliance with French Cartes Bancaires (CB) and German Girocard schemes was mandatory by Q3 2024.",
                evidence_ids=["ADR-014", "PAY-1042"],
            ),
            DecisionReason(
                reason="Seamless protocol compatibility with Apex Retail's existing ISO 8583 core batch settlement specifications.",
                evidence_ids=["ADR-014", "SLACK-001"],
            ),
        ],
        changed_assumptions=[
            "Provider Y obtained BaFin and ECB regulatory approval for native card acquiring in Feb 2026.",
            "Apex Retail completed migration to Card Gateway REST v2 in March 2026, eliminating legacy ISO 8583 socket server traffic.",
        ],
        alternatives=["Provider Y", "Provider Z"],
        evidence_ids=["ADR-014", "PAY-1042", "SLACK-001", "SLACK-005", "PAY-3310", "ADR-028"],
        impact_summary=(
            "Two high-impact gating constraints from April 2024 have been invalidated by 2026 organizational records: "
            "Provider Y achieved European debit scheme certification, and Apex Retail retired ISO 8583. "
            "Formal technical leadership review is required."
        ),
        confidence=0.95,
        decision_id="finflow-provider-x-europe",
    )

    # Print the semantic serialized memory
    print("\nSerialized Semantic Memory Content:")
    print("-" * 50)
    print(decision_memory_service.serialize_investigation_memory(sample_request))
    print("-" * 50)

    try:
        response = await decision_memory_service.aretain_investigation(sample_request)
        print(f"\n[SUCCESS] Memory retained in Hindsight Cloud!")
        print(f"Document ID:        {response.document_id}")
        print(f"Memory Type:        {response.memory_type}")
        print(f"Decision ID:        {response.decision_id}")
        print(f"Investigation Date: {response.investigation_date}")
    except Exception as exc:
        print(f"\n[ERROR] Failed to retain memory in Hindsight: {exc}")
        return

    # 2. Test semantic recall of previous investigations
    print("\n" + "=" * 70)
    print("STEP 2: Testing Semantic Recall of Previous Investigations from Hindsight...")
    query = "Previous WHY decision investigations regarding European card payments and Provider X"
    print(f"Recall Query: '{query}'\n")

    # Give Hindsight index a brief moment
    await asyncio.sleep(2.0)

    try:
        recalled = await decision_memory_service.arecall_previous_investigations(
            question=query,
            limit=3,
        )

        print(f"Found {len(recalled)} prior investigation memories in Hindsight:")
        for idx, inv in enumerate(recalled, start=1):
            print(f"\n--- RECALLED PRIOR INVESTIGATION #{idx} ---")
            print(f"Date:         {inv.investigation_date}")
            print(f"Decision:     {inv.decision}")
            print(f"Status:       {inv.status}")
            print(f"Confidence:   {inv.confidence:.2f}")
            print(f"Prior AI:     {inv.is_prior_ai_reasoning} (Labelled as Prior AI reasoning)")
            print(f"Key Reasons:  {len(inv.key_reasoning)} points")
            for r in inv.key_reasoning[:2]:
                print(f"  • {r}")
            print(f"Changed Assumptions: {len(inv.changed_assumptions)}")
            for ca in inv.changed_assumptions:
                print(f"  ⚠ {ca}")
            print(f"Evidence Cited in Prior Run: {', '.join(inv.evidence_ids)}")

        if recalled:
            print("\n[VERIFIED] Hindsight memory evolution is working live against Hindsight Cloud!")
        else:
            print("\n[NOTE] Hindsight recall returned 0 matches immediately after retain (indexing may take a few moments).")

    except Exception as exc:
        print(f"\n[ERROR] Recall failed: {exc}")


if __name__ == "__main__":
    asyncio.run(main())
