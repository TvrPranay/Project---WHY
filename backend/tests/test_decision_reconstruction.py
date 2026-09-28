"""Unit tests for Decision Reconstruction Agent (Phase 4).

Tests schema validation, evidence packaging, prompt generation, JSON parsing,
insufficient evidence, conflict handling, confidence heuristic, and source preservation.
"""

import json
import pytest
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

from app.schemas.decision import (
    DecisionAlternative,
    DecisionConflict,
    DecisionExplanation,
    DecisionReason,
    DecisionStatusEnum,
    EvidenceItem,
    ReconstructDecisionRequest,
)
from app.services.decision_reconstruction import DecisionReconstructionService
from app.services.llm_service import MockLLMService


@pytest.fixture
def sample_evidence_items():
    """Sample typed EvidenceItem records for testing."""
    return [
        EvidenceItem(
            source_type="architecture",
            title="ADR-014: European Card Payment Gateway Selection",
            content="Selected Provider X for European card payments due to French CB and German Girocard licenses.",
            author="elena.rostova",
            recorded_at=datetime(2024, 4, 15, 10, 0),
            external_url="ADR-014",
            confidence_score=0.95,
        ),
        EvidenceItem(
            source_type="jira",
            title="PAY-1042: Evaluate EU payment acquirers",
            content="Provider X is compatible with Apex Retail ISO 8583 batch pipeline. Provider Y lacked Girocard.",
            author="devon.chen",
            recorded_at=datetime(2024, 3, 20, 14, 30),
            external_url="PAY-1042",
            confidence_score=0.90,
        ),
        EvidenceItem(
            source_type="slack",
            title="SLACK-001: Architecture discussion on Provider X",
            content="Marcus Vance confirmed Apex Retail settlement pipeline requires zero changes with Provider X.",
            author="marcus.vance",
            recorded_at=datetime(2024, 4, 5, 9, 15),
            external_url="SLACK-001",
            confidence_score=0.85,
        ),
    ]


def test_decision_schema_validation():
    """1. Test DecisionExplanation and sub-schemas validate properly."""
    explanation = DecisionExplanation(
        question="Why did FinFlow choose Provider X?",
        decision="Selected Provider X for EU card payments",
        summary="Detailed summary of selection based on evidence.",
        reasons=[
            DecisionReason(reason="Domestic licensing compliance", evidence_ids=["ADR-014"]),
            DecisionReason(reason="ISO 8583 compatibility", evidence_ids=["ADR-014", "PAY-1042"]),
        ],
        alternatives=[
            DecisionAlternative(name="Provider Y", reason_not_selected="No Girocard", evidence_ids=["PAY-1042"]),
        ],
        constraints=["Q3 2024 deadline"],
        evidence=[],
        participants=["devon.chen", "elena.rostova"],
        dependencies=["Legacy Payment Gateway adapter"],
        confidence=0.90,
        confidence_rationale="High quality multi-source evidence",
        source_documents=["ADR-014", "PAY-1042"],
    )

    data = explanation.model_dump()
    assert data["decision"] == "Selected Provider X for EU card payments"
    assert len(data["reasons"]) == 2
    assert data["confidence"] == 0.90
    assert "ADR-014" in data["source_documents"]

    # Test request model validation
    req = ReconstructDecisionRequest(question="Why did FinFlow choose Provider X?")
    assert req.question == "Why did FinFlow choose Provider X?"
    assert req.limit == 15

    with pytest.raises(Exception):
        ReconstructDecisionRequest(question="hi")  # min_length 3 violation


def test_evidence_package_construction(sample_evidence_items):
    """2. Test evidence package construction formats all items with IDs, authors, and dates."""
    service = DecisionReconstructionService()
    package = service._format_evidence_package(sample_evidence_items)

    assert "DOCUMENT ID: ADR-014" in package
    assert "DOCUMENT ID: PAY-1042" in package
    assert "DOCUMENT ID: SLACK-001" in package
    assert "AUTHOR: elena.rostova" in package
    assert "French CB and German Girocard" in package


def test_llm_prompt_construction(sample_evidence_items):
    """3. Test LLM prompt construction enforces strict evidence constraints and JSON structure."""
    service = DecisionReconstructionService()
    package = service._format_evidence_package(sample_evidence_items)
    prompt = service._build_reconstruction_prompt("Why Provider X?", package)

    assert "USER QUESTION:" in prompt
    assert "HISTORICAL EVIDENCE RETRIEVED FROM HINDSIGHT:" in prompt
    assert "DOCUMENT ID: ADR-014" in prompt
    assert "evidence_ids" in prompt
    assert "CRITICAL INSTRUCTIONS:" in prompt


def test_structured_json_parsing():
    """4. Test parsing of valid JSON output with and without markdown code blocks."""
    service = DecisionReconstructionService()

    raw_clean = '{"decision": "Selected X", "summary": "Because of Y", "reasons": []}'
    parsed = service._parse_llm_json(raw_clean)
    assert parsed["decision"] == "Selected X"

    raw_fenced = '```json\n{"decision": "Selected X", "summary": "Because of Y", "reasons": []}\n```'
    parsed_fenced = service._parse_llm_json(raw_fenced)
    assert parsed_fenced["decision"] == "Selected X"


def test_invalid_llm_output_handling():
    """5. Test handling of malformed or non-JSON output from LLM raises ValueError."""
    service = DecisionReconstructionService()

    with pytest.raises(ValueError, match="invalid JSON"):
        service._parse_llm_json("This is not JSON at all.")


@pytest.mark.asyncio
async def test_missing_evidence_handling():
    """6. Test handling when Hindsight returns no memories or unrelated question."""
    mock_memory = MagicMock()
    mock_memory.arecall_memories = AsyncMock(return_value=[])

    service = DecisionReconstructionService(memory_service=mock_memory)
    explanation = await service.reconstruct_decision(question="Why did FinFlow adopt Kubernetes in 2019?")

    assert explanation.decision == "Unknown / Insufficient Evidence"
    assert "Insufficient historical evidence" in explanation.summary
    assert explanation.confidence == 0.0
    assert len(explanation.reasons) == 0


def test_conflicting_evidence_handling():
    """7. Test detection and handling of conflicting evidence."""
    service = DecisionReconstructionService()
    valid_ids = {"ADR-014", "PAY-1042"}

    raw_conflicts = [
        {
            "topic": "Girocard licensing timeline",
            "statements": [
                "ADR-014 says licensing was secured in Q1 2024.",
                "PAY-1042 says licensing was delayed until Q4 2024.",
            ],
            "evidence_ids": ["ADR-014", "PAY-1042"],
        }
    ]

    conflicts = service._sanitize_conflicts(raw_conflicts, valid_ids)
    assert len(conflicts) == 1
    assert conflicts[0].topic == "Girocard licensing timeline"
    assert len(conflicts[0].statements) == 2
    assert "ADR-014" in conflicts[0].evidence_ids


def test_confidence_calculation(sample_evidence_items):
    """8. Test explainable confidence calculation heuristic."""
    service = DecisionReconstructionService()

    reasons = [
        DecisionReason(reason="Reason 1", evidence_ids=["ADR-014"]),
        DecisionReason(reason="Reason 2", evidence_ids=["PAY-1042"]),
    ]
    cited_ids = {"ADR-014", "PAY-1042", "SLACK-001"}

    # Consistent multi-source test
    score, rationale = service._calculate_confidence(
        memories=sample_evidence_items,
        reasons=reasons,
        conflicts=[],
        cited_ids=cited_ids,
    )
    assert 0.80 <= score <= 0.95
    assert "Source diversity" in rationale
    assert "Evidence backing" in rationale

    # Test penalty when conflict exists
    conflicts = [
        DecisionConflict(topic="Dispute", statements=["A", "B"], evidence_ids=["ADR-014"])
    ]
    score_with_conflict, rationale_conflict = service._calculate_confidence(
        memories=sample_evidence_items,
        reasons=reasons,
        conflicts=conflicts,
        cited_ids=cited_ids,
    )
    assert score_with_conflict < score
    assert "conflict" in rationale_conflict.lower()


def test_source_id_preservation_and_filtering(sample_evidence_items):
    """9. Test that only real recalled document IDs are preserved and hallucinations stripped."""
    service = DecisionReconstructionService()
    valid_ids = service._extract_valid_document_ids(sample_evidence_items)

    assert "ADR-014" in valid_ids
    assert "PAY-1042" in valid_ids
    assert "SLACK-001" in valid_ids

    raw_reasons = [
        {"reason": "Valid cited reason", "evidence_ids": ["ADR-014", "FABRICATED-DOC-999"]},
        {"reason": "Only fake citations", "evidence_ids": ["FAKE-123"]},
    ]

    sanitized = service._sanitize_reasons(raw_reasons, valid_ids)
    assert len(sanitized) == 2
    assert sanitized[0].evidence_ids == ["ADR-014"]  # FABRICATED-DOC-999 stripped
    assert sanitized[1].evidence_ids == []  # FAKE-123 stripped


@pytest.mark.asyncio
async def test_full_reconstruction_pipeline_with_mock(sample_evidence_items):
    """10. End-to-end unit test of reconstruction pipeline using MockLLMService."""
    mock_memory = MagicMock()
    mock_memory.arecall_memories = AsyncMock(return_value=sample_evidence_items)

    mock_llm = MockLLMService()
    service = DecisionReconstructionService(memory_service=mock_memory, llm_service=mock_llm)

    explanation = await service.reconstruct_decision("Why did FinFlow choose Provider X for European card payments?")

    assert explanation.decision != ""
    assert len(explanation.reasons) >= 1
    assert "ADR-014" in explanation.source_documents or "PAY-1042" in explanation.source_documents
    assert 0.0 < explanation.confidence <= 1.0
    assert len(explanation.evidence) == 3
