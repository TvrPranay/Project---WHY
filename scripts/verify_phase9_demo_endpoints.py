"""Phase 9: Comprehensive Endpoint & Guided Demo Flow Verification.

Verifies that all 5 key endpoints used by Guided Demo and Normal mode are fully operational:
1. POST /api/v1/decisions/reconstruct (with memory_mode='none' and 'hindsight')
2. POST /api/v1/decisions/assess
3. POST /api/v1/decisions/remember
4. POST /api/v1/decisions/history
5. POST /api/v1/demo/memory-comparison
"""

import asyncio
import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.schemas.decision import DecisionStatusEnum

client = TestClient(app)

def test_endpoints():
    print("=" * 70)
    print("PHASE 9: VERIFYING ALL 5 API ENDPOINTS FOR GUIDED DEMO")
    print("=" * 70)

    question = "Why did FinFlow choose Provider X for European card payments?"

    # 1. POST /api/v1/decisions/reconstruct (memory_mode='none')
    print("\n[1/5] Testing POST /api/v1/decisions/reconstruct (memory_mode='none')...")
    resp_none = client.post("/api/v1/decisions/reconstruct", json={"question": question, "memory_mode": "none"})
    print(f"Status: {resp_none.status_code}")
    assert resp_none.status_code == 200, f"Failed: {resp_none.text}"
    data_none = resp_none.json()
    assert data_none["status"] == "INSUFFICIENT EVIDENCE"
    assert len(data_none["evidence"]) == 0
    print(f"Result: {data_none['status']} (Evidence recalled: {len(data_none['evidence'])})")

    # 2. POST /api/v1/demo/memory-comparison
    print("\n[2/5] Testing POST /api/v1/demo/memory-comparison...")
    resp_comp = client.post("/api/v1/demo/memory-comparison", json={"question": question})
    print(f"Status: {resp_comp.status_code}")
    assert resp_comp.status_code == 200, f"Failed: {resp_comp.text}"
    data_comp = resp_comp.json()
    assert "INSUFFICIENT" in data_comp["without_memory"]["status"]
    assert "RECONSTRUCTED" in data_comp["with_hindsight"]["status"]
    print(f"Mode None: {data_comp['without_memory']['status']} ({data_comp['without_memory']['evidence_count']} evidence)")
    print(f"Mode Hindsight: {data_comp['with_hindsight']['status']} ({data_comp['with_hindsight']['evidence_count']} evidence)")

    # 3. POST /api/v1/decisions/assess
    print("\n[3/5] Testing POST /api/v1/decisions/assess...")
    resp_assess = client.post("/api/v1/decisions/assess", json={"question": question})
    print(f"Status: {resp_assess.status_code}")
    assert resp_assess.status_code == 200, f"Failed: {resp_assess.text}"
    data_assess = resp_assess.json()
    assert "status" in data_assess
    print(f"Assessment Status: {data_assess['status']}")
    print(f"Affected Reasons: {len(data_assess.get('affected_reasons', []))}")

    # 4. POST /api/v1/decisions/remember
    print("\n[4/5] Testing POST /api/v1/decisions/remember...")
    remember_payload = {
        "question": question,
        "decision": "FinFlow selected Provider X for European acquired card payments.",
        "status": data_assess["status"],
        "reasons": [{"reason": "Domestic licensing compliance", "evidence_ids": ["ADR-014"]}],
        "changed_assumptions": data_assess.get("changed_assumptions", ["Provider Y obtained certification"]),
        "alternatives": ["Provider Y", "Provider Z"],
        "evidence_ids": ["ADR-014", "PAY-1042"],
        "impact_summary": "Historical reasoning has materially changed.",
        "confidence": 0.85,
        "decision_id": "finflow-provider-x-europe",
    }
    resp_rem = client.post("/api/v1/decisions/remember", json=remember_payload)
    print(f"Status: {resp_rem.status_code}")
    assert resp_rem.status_code == 200, f"Failed: {resp_rem.text}"
    data_rem = resp_rem.json()
    assert data_rem["success"] is True
    print(f"Remember success: {data_rem['success']}, Doc ID: {data_rem.get('document_id')}")

    # 5. POST /api/v1/decisions/history
    print("\n[5/5] Testing POST /api/v1/decisions/history...")
    resp_hist = client.post("/api/v1/decisions/history", json={"question": question, "limit": 5})
    print(f"Status: {resp_hist.status_code}")
    assert resp_hist.status_code == 200, f"Failed: {resp_hist.text}"
    data_hist = resp_hist.json()
    print(f"History items recalled: {len(data_hist.get('items', []))}")

    print("\n" + "=" * 70)
    print("ALL 5 ENDPOINTS FULLY VERIFIED FOR PHASE 9 GUIDED DEMO!")
    print("=" * 70)

if __name__ == "__main__":
    test_endpoints()
