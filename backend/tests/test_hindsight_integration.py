"""Live integration tests for Hindsight.

These tests execute against a running Hindsight instance.
They are SKIPPED by default and ONLY run when:
HINDSIGHT_INTEGRATION_TEST=true
"""

import os
import uuid
import pytest
from app.core.config import get_settings
from app.memory.hindsight import HindsightMemoryService

INTEGRATION_FLAG = os.getenv("HINDSIGHT_INTEGRATION_TEST", "").strip().lower()
RUN_INTEGRATION = INTEGRATION_FLAG in ("1", "true", "yes")


@pytest.mark.skipif(
    not RUN_INTEGRATION,
    reason="Live Hindsight integration tests skipped. Set HINDSIGHT_INTEGRATION_TEST=true to run.",
)
def test_live_hindsight_bank_creation_retention_and_recall():
    """Verify live Hindsight retain and recall cycle against an isolated test bank."""
    settings = get_settings()
    service = HindsightMemoryService(settings=settings)

    # Use unique isolated test bank namespace to protect production/demo data
    test_bank_id = f"test-why-integration-{uuid.uuid4().hex[:8]}"
    test_doc_id = f"TEST-DOC-{uuid.uuid4().hex[:6]}"
    unique_phrase = f"quantum-card-rail-{uuid.uuid4().hex[:8]}"

    try:
        # Step 1: Ensure test bank exists
        created = service.ensure_bank_exists(
            bank_id=test_bank_id,
            name=f"WHY Integration Test ({test_bank_id})",
            mission="Temporary isolated test bank for automated testing.",
        )
        assert created is True

        # Step 2: Retain a unique test memory
        retained_id = service.retain_memory(
            bank_id=test_bank_id,
            content=f"FinFlow verified that the {unique_phrase} processor achieved 99.999% uptime.",
            context="test: Automated Integration Verification",
            document_id=test_doc_id,
            metadata={"environment": "test", "module": "integration"},
            tags=["test", "integration"],
        )
        assert retained_id is not None

        # Step 3: Recall memory using the unique phrase
        evidence = service.recall_memories(
            bank_id=test_bank_id,
            query=f"What was the uptime of {unique_phrase}?",
            limit=5,
        )

        assert len(evidence) > 0
        matching = [e for e in evidence if unique_phrase in e.content]
        assert len(matching) > 0, f"Expected recalled memories to contain '{unique_phrase}'"
        assert matching[0].external_url == test_doc_id or matching[0].source_type is not None

    finally:
        # Cleanup: attempt to delete the temporary test bank
        try:
            client = service.get_client()
            if hasattr(client, "delete_bank"):
                client.delete_bank(bank_id=test_bank_id)
        except Exception:
            pass
