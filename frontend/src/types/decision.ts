/**
 * TypeScript definitions for WHY decision reconstruction and invalidation.
 * Matches backend Pydantic models in backend/app/schemas/decision.py.
 */

export type DecisionStatus =
  | 'ACTIVE'
  | 'REVIEW REQUIRED'
  | 'STALE'
  | 'CONFLICTED'
  | 'INSUFFICIENT EVIDENCE'
  | 'DEPRECATED'
  | 'UNKNOWN';

export interface EvidenceItem {
  source_type: string;
  title: string;
  content: string;
  author?: string | null;
  recorded_at?: string | null;
  timestamp?: string | null;
  external_url?: string | null;
  confidence_score?: number | null;
  relevance_rationale?: string | null;
}

export interface DecisionReason {
  reason: string;
  evidence_ids: string[];
}

export interface DecisionAlternative {
  name: string;
  reason_not_selected: string;
  evidence_ids: string[];
}

export interface DecisionTimeframe {
  start?: string | null;
  end?: string | null;
}

export interface DecisionConflict {
  topic: string;
  statements: string[];
  evidence_ids: string[];
}

export interface PreviousInvestigationItem {
  investigation_date?: string | null;
  decision: string;
  status: string;
  confidence: number;
  key_reasoning: string[];
  evidence_ids: string[];
  changed_assumptions?: string[];
  summary?: string | null;
  document_id?: string | null;
  is_prior_ai_reasoning: boolean;
}

export interface DecisionExplanation {
  question: string;
  decision: string;
  summary: string;
  reasons: DecisionReason[];
  alternatives: DecisionAlternative[];
  constraints: string[];
  evidence: EvidenceItem[];
  participants: string[];
  dependencies: string[];
  timeframe?: DecisionTimeframe | null;
  conflicts: DecisionConflict[];
  confidence: number;
  confidence_rationale?: string | null;
  source_documents: string[];
  prior_investigations?: PreviousInvestigationItem[];
  prior_investigations_count?: number;
  decision_id?: string | null;
  title?: string | null;
  status?: DecisionStatus | null;
}

export interface ReasonAssessment {
  original_reason: string;
  original_evidence_ids: string[];
  current_support: 'STILL_SUPPORTED' | 'WEAKENED' | 'INVALIDATED' | 'CONFLICTED' | string;
  new_evidence_ids: string[];
  assessment: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  confidence: number;
}

export interface DecisionAssessment {
  decision: string;
  status: DecisionStatus;
  original_reasons: DecisionReason[];
  changed_assumptions: string[];
  affected_reasons: ReasonAssessment[];
  new_evidence: EvidenceItem[];
  impact_summary: string;
  confidence: number;
  confidence_rationale?: string | null;
  evidence: EvidenceItem[];
  source_documents: string[];
  assessed_at: string;
}

export interface ReconstructDecisionRequest {
  question: string;
  bank_id?: string | null;
  limit?: number;
}

export interface AssessDecisionRequest {
  question: string;
  bank_id?: string | null;
  limit?: number;
}

export interface RememberDecisionRequest {
  question: string;
  decision: string;
  status: DecisionStatus | string;
  reasons: DecisionReason[];
  changed_assumptions: string[];
  alternatives?: string[];
  evidence_ids?: string[];
  impact_summary?: string | null;
  confidence?: number;
  bank_id?: string | null;
  decision_id?: string | null;
}

export interface RememberDecisionResponse {
  success: boolean;
  memory_type: string;
  decision_id: string;
  message: string;
  document_id?: string | null;
  investigation_date: string;
}

export interface DecisionHistoryRequest {
  question: string;
  bank_id?: string | null;
  limit?: number;
}

export interface DecisionHistoryResponse {
  question: string;
  count: number;
  investigations: PreviousInvestigationItem[];
}

export type MemoryMode = 'none' | 'hindsight';

export interface MemoryModeResult {
  memory_mode: MemoryMode;
  status: string;
  evidence_count: number;
  prior_investigations_count: number;
  citation_count: number;
  bank_id?: string | null;
  narrative: string;
  explanation: DecisionExplanation;
}

export interface MemoryComparisonRequest {
  question: string;
  bank_id?: string | null;
  limit?: number;
}

export interface MemoryComparisonResponse {
  question: string;
  without_memory: MemoryModeResult;
  with_hindsight: MemoryModeResult;
}


