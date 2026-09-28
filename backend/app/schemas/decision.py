"""Schemas for decision queries, evidence provenance, and invalidation statuses."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DecisionStatus(str, Enum):
    """Lifecycle and temporal validity status of an architectural decision."""

    ACTIVE = "ACTIVE"
    REVIEW_REQUIRED = "REVIEW REQUIRED"
    STALE = "STALE"
    CONFLICTED = "CONFLICTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT EVIDENCE"
    # Backward compatibility
    DEPRECATED = "DEPRECATED"
    UNKNOWN = "UNKNOWN"


# Backward compatibility alias
DecisionStatusEnum = DecisionStatus


class MemoryMode(str, Enum):
    """Investigation mode: genuine no-memory baseline or Hindsight persistent memory."""

    NONE = "none"
    HINDSIGHT = "hindsight"



class EvidenceItem(BaseModel):
    """A historical evidence item retrieved from Hindsight organizational memory."""

    source_type: str = Field(
        ...,
        description="Origin source (e.g. slack, jira, pull_request, incident, architecture).",
        examples=["architecture"],
    )
    title: str = Field(..., description="Short title or subject of the evidence.")
    content: str = Field(..., description="Extracted content or verbatim excerpt.")
    author: Optional[str] = Field(default=None, description="Author or speaker.")
    recorded_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp when the event originally occurred.",
    )
    external_url: Optional[str] = Field(
        default=None,
        description="Reference URL or identifier in the source system.",
    )
    confidence_score: Optional[float] = Field(
        default=None,
        description="Hindsight recall relevance score.",
    )


class DecisionReason(BaseModel):
    """A core rationale justifying the decision with supporting evidence citations."""

    reason: str = Field(..., description="The rationale statement.")
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="List of document IDs backing this specific rationale.",
    )


class DecisionAlternative(BaseModel):
    """An alternative option considered during the decision process."""

    name: str = Field(..., description="Name or description of the alternative option.")
    reason_not_selected: str = Field(
        ...,
        description="Explanation of why this alternative was rejected or postponed.",
    )
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="Supporting document IDs for the alternative.",
    )


class DecisionTimeframe(BaseModel):
    """Estimated or documented timeframe for the decision."""

    start: Optional[str] = Field(default=None, description="Start date or period of decision effect.")
    end: Optional[str] = Field(default=None, description="Sunset date, expiration, or ongoing period.")


class DecisionConflict(BaseModel):
    """A recorded contradiction or inconsistency between historical evidence items."""

    topic: str = Field(..., description="Topic or point of contention.")
    statements: List[str] = Field(
        default_factory=list,
        description="Contrasting statements found in evidence.",
    )
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="Source document IDs exhibiting the conflict.",
    )


class PreviousInvestigationItem(BaseModel):
    """A remembered prior decision investigation recalled from Hindsight memory (prior AI reasoning)."""

    investigation_date: Optional[str] = Field(
        default=None,
        description="Timestamp or date when this prior investigation was retained.",
    )
    decision: str = Field(
        ...,
        description="The decision statement reconstructed during the prior investigation.",
    )
    status: str = Field(
        default="REVIEW REQUIRED",
        description="Temporal validity status determined during the prior investigation.",
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence score assigned to the prior investigation.",
    )
    key_reasoning: List[str] = Field(
        default_factory=list,
        description="Key supporting reasoning statements from the prior investigation.",
    )
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="Primary evidence document IDs referenced in the prior investigation.",
    )
    changed_assumptions: List[str] = Field(
        default_factory=list,
        description="Assumptions identified as altered or invalidated in the prior investigation.",
    )
    summary: Optional[str] = Field(
        default=None,
        description="Full semantic summary of the prior investigation.",
    )
    document_id: Optional[str] = Field(
        default=None,
        description="Hindsight document ID or external reference.",
    )
    is_prior_ai_reasoning: bool = Field(
        default=True,
        description="Explicit flag confirming this represents prior AI reasoning, not primary evidence.",
    )


class DecisionExplanation(BaseModel):
    """Structured reconstruction answering WHY an organizational decision was made."""

    question: str = Field(..., description="The original user question.")
    decision: str = Field(..., description="Concise statement of the decision made.")
    summary: str = Field(
        ...,
        description="Comprehensive summary explaining why this decision was made based on evidence.",
    )
    reasons: List[DecisionReason] = Field(
        default_factory=list,
        description="Key reasons and assumptions that justified the decision with source citations.",
    )
    alternatives: List[DecisionAlternative] = Field(
        default_factory=list,
        description="Alternative options considered and why they were not chosen.",
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Technical, operational, or legal constraints governing the decision.",
    )
    evidence: List[EvidenceItem] = Field(
        default_factory=list,
        description="Supporting evidence items retrieved from Hindsight persistent memory.",
    )
    participants: List[str] = Field(
        default_factory=list,
        description="Key individuals or teams involved in the decision.",
    )
    dependencies: List[str] = Field(
        default_factory=list,
        description="Technical systems, third-party services, or organizational dependencies.",
    )
    timeframe: Optional[DecisionTimeframe] = Field(
        default=None,
        description="Time period or lifecycle timeframe for the decision.",
    )
    conflicts: List[DecisionConflict] = Field(
        default_factory=list,
        description="Conflicting statements or inconsistencies found in the historical record.",
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Explainable evidence-confidence score heuristic (0.0 to 1.0).",
    )
    confidence_rationale: Optional[str] = Field(
        default=None,
        description="Transparent justification of the confidence score.",
    )
    source_documents: List[str] = Field(
        default_factory=list,
        description="Unique document IDs of the primary sources supporting this reconstruction.",
    )
    prior_investigations: List[PreviousInvestigationItem] = Field(
        default_factory=list,
        description="Previous WHY investigation memories recalled from Hindsight (prior AI reasoning).",
    )
    prior_investigations_count: int = Field(
        default=0,
        description="Number of prior investigation memories recalled from Hindsight.",
    )

    # Backward compatibility fields with Phase 1
    decision_id: Optional[str] = Field(
        default=None,
        description="Optional unique identifier for the decision.",
    )
    title: Optional[str] = Field(
        default=None,
        description="Title of the decision subject.",
    )
    status: Optional[DecisionStatus] = Field(
        default=DecisionStatus.ACTIVE,
        description="Current validity status.",
    )
    why_summary: Optional[str] = Field(
        default=None,
        description="Alias for summary for backward compatibility.",
    )
    original_rationale: Optional[List[str]] = Field(
        default=None,
        description="Alias for reasons text for backward compatibility.",
    )
    what_changed: Optional[str] = Field(
        default=None,
        description="Analysis of new information.",
    )
    invalidation_triggers: List[str] = Field(
        default_factory=list,
        description="Signals indicating reasoning may no longer hold.",
    )
    what_could_break: List[str] = Field(
        default_factory=list,
        description="Known dependencies or consequences.",
    )


class ReasonAssessment(BaseModel):
    """Detailed temporal assessment of an individual original rationale point."""

    original_reason: str = Field(..., description="The original rationale statement.")
    original_evidence_ids: List[str] = Field(
        default_factory=list,
        description="Original document IDs supporting the assumption.",
    )
    current_support: str = Field(
        ...,
        description="Status of current support: STILL_SUPPORTED, WEAKENED, INVALIDATED, or CONFLICTED.",
    )
    new_evidence_ids: List[str] = Field(
        default_factory=list,
        description="Later document IDs altering or challenging this assumption.",
    )
    assessment: str = Field(
        ...,
        description="Detailed explanation of how later evidence impacts the assumption.",
    )
    impact: str = Field(
        default="MEDIUM",
        description="Impact level: HIGH, MEDIUM, or LOW.",
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence score for this specific reason assessment.",
    )


class DecisionAssessment(BaseModel):
    """Complete temporal invalidation assessment comparing original reasons with later evidence."""

    decision: str = Field(..., description="The decision evaluated.")
    status: DecisionStatus = Field(
        ...,
        description="Overall decision validity status (ACTIVE, REVIEW_REQUIRED, STALE, CONFLICTED, INSUFFICIENT_EVIDENCE).",
    )
    original_reasons: List[DecisionReason] = Field(
        default_factory=list,
        description="Original reasons that justified the decision.",
    )
    changed_assumptions: List[str] = Field(
        default_factory=list,
        description="Specific underlying assumptions that no longer hold.",
    )
    affected_reasons: List[ReasonAssessment] = Field(
        default_factory=list,
        description="Detailed reason-by-reason assessments.",
    )
    new_evidence: List[EvidenceItem] = Field(
        default_factory=list,
        description="Later evidence items retrieved from Hindsight.",
    )
    impact_summary: str = Field(
        ...,
        description="Executive summary explaining why the decision status was assigned.",
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Explainable evidence-confidence score heuristic (0.0 to 1.0).",
    )
    confidence_rationale: Optional[str] = Field(
        default=None,
        description="Justification of the confidence score.",
    )
    evidence: List[EvidenceItem] = Field(
        default_factory=list,
        description="All relevant evidence items (both historical and later).",
    )
    source_documents: List[str] = Field(
        default_factory=list,
        description="All unique cited document IDs.",
    )
    assessed_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of the assessment.",
    )


class ReconstructDecisionRequest(BaseModel):
    """Request payload for reconstructing a historical decision from memory."""

    question: str = Field(
        ...,
        min_length=3,
        description="Natural language question, e.g., 'Why did FinFlow choose Provider X for European card payments?'",
        examples=["Why did FinFlow choose Provider X for European card payments?"],
    )
    bank_id: Optional[str] = Field(
        default=None,
        description="Optional explicit memory bank ID (defaults to configured HINDSIGHT_BANK_ID).",
    )
    limit: int = Field(
        default=15,
        ge=1,
        le=50,
        description="Maximum number of evidence memories to retrieve from Hindsight.",
    )
    memory_mode: MemoryMode = Field(
        default=MemoryMode.HINDSIGHT,
        description="Investigation memory mode: 'none' (bypasses memory recall) or 'hindsight' (uses persistent memory).",
    )


class AssessDecisionRequest(BaseModel):
    """Request payload for assessing temporal validity of a decision."""

    question: str = Field(
        ...,
        min_length=3,
        description="Natural language question, e.g., 'Why did FinFlow choose Provider X for European card payments?'",
        examples=["Why did FinFlow choose Provider X for European card payments?"],
    )
    bank_id: Optional[str] = Field(
        default=None,
        description="Optional explicit memory bank ID (defaults to configured HINDSIGHT_BANK_ID).",
    )
    limit: int = Field(
        default=15,
        ge=1,
        le=50,
        description="Maximum number of evidence memories to retrieve from Hindsight.",
    )


class DecisionQueryRequest(BaseModel):
    """Request payload for investigating a decision (backward compatible)."""

    query: str = Field(
        ...,
        description="Natural language question, e.g., 'Why does the Legacy Payment Gateway still exist?'",
        examples=["Why does the Legacy Payment Gateway still exist?"],
    )
    decision_id: Optional[str] = Field(
        default=None,
        description="Optional explicit identifier for the decision.",
        examples=["dec-finflow-legacy-gateway"],
    )


class DecisionQueryResponse(BaseModel):
    """API response envelope for decision query."""

    query: str
    explanation: DecisionExplanation


class RememberDecisionRequest(BaseModel):
    """Payload to retain a completed decision investigation into Hindsight."""

    question: str = Field(..., description="The original question investigated.")
    decision: str = Field(..., description="The decision statement.")
    status: DecisionStatus = Field(default=DecisionStatus.REVIEW_REQUIRED, description="Assessment status.")
    reasons: List[DecisionReason] = Field(default_factory=list, description="Original reasoning points.")
    changed_assumptions: List[str] = Field(default_factory=list, description="Invalidated or altered assumptions.")
    alternatives: List[str] = Field(default_factory=list, description="Alternative options considered.")
    evidence_ids: List[str] = Field(default_factory=list, description="Document IDs cited.")
    impact_summary: Optional[str] = Field(default=None, description="Executive summary of assessment.")
    confidence: float = Field(default=0.95, ge=0.0, le=1.0, description="Confidence score.")
    bank_id: Optional[str] = Field(default=None, description="Target Hindsight bank ID.")
    decision_id: Optional[str] = Field(default=None, description="Identifier for the decision.")


class RememberDecisionResponse(BaseModel):
    """Response confirming retention of an investigation in Hindsight."""

    success: bool = True
    memory_type: str = "decision_investigation"
    decision_id: str
    message: str = "Decision reasoning retained in Hindsight."
    document_id: Optional[str] = None
    investigation_date: str


class DecisionHistoryRequest(BaseModel):
    """Payload to query previous WHY investigations from Hindsight."""

    question: str = Field(..., min_length=3, description="Decision topic or question.")
    bank_id: Optional[str] = Field(default=None, description="Target Hindsight bank ID.")
    limit: int = Field(default=5, ge=1, le=20, description="Max previous investigations to recall.")


class DecisionHistoryResponse(BaseModel):
    """Response returning recalled previous investigation memories."""

    question: str
    count: int
    investigations: List[PreviousInvestigationItem]


class MemoryModeResult(BaseModel):
    """Result of an investigation run in a specific memory mode."""

    memory_mode: MemoryMode = Field(..., description="Mode executed: 'none' or 'hindsight'.")
    status: str = Field(..., description="Resulting decision or evidence status.")
    evidence_count: int = Field(default=0, description="Number of primary evidence items retrieved.")
    prior_investigations_count: int = Field(default=0, description="Number of prior investigation memories recalled.")
    citation_count: int = Field(default=0, description="Number of verified source citations in reasoning.")
    bank_id: Optional[str] = Field(default=None, description="Memory bank identifier if memory was enabled.")
    narrative: str = Field(..., description="Executive narrative describing the outcome.")
    explanation: DecisionExplanation = Field(..., description="Full structured decision reconstruction.")


class MemoryComparisonRequest(BaseModel):
    """Request payload to execute a controlled memory comparison."""

    question: str = Field(
        ...,
        min_length=3,
        description="The decision question to evaluate under both memory modes.",
        examples=["Why did FinFlow choose Provider X for European card payments?"],
    )
    bank_id: Optional[str] = Field(
        default=None,
        description="Optional explicit memory bank ID (defaults to configured HINDSIGHT_BANK_ID).",
    )
    limit: int = Field(
        default=15,
        ge=1,
        le=50,
        description="Maximum number of evidence memories to retrieve when memory is enabled.",
    )


class MemoryComparisonResponse(BaseModel):
    """Response containing the controlled before/after memory investigation results."""

    question: str
    without_memory: MemoryModeResult
    with_hindsight: MemoryModeResult


