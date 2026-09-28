import React, { useState } from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  History, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Info,
  Calendar
} from 'lucide-react';
import { 
  DecisionAssessment, 
  DecisionExplanation, 
  PreviousInvestigationItem, 
  RememberDecisionResponse 
} from '../types/decision';
import { rememberDecision, fetchDecisionHistory } from '../services/api';

interface DecisionMemorySectionProps {
  explanation: DecisionExplanation;
  assessment?: DecisionAssessment | null;
  primaryEvidenceCount: number;
}

export const DecisionMemorySection: React.FC<DecisionMemorySectionProps> = ({
  explanation,
  assessment,
  primaryEvidenceCount,
}) => {
  const [isRemembering, setIsRemembering] = useState<boolean>(false);
  const [rememberedResponse, setRememberedResponse] = useState<RememberDecisionResponse | null>(null);
  const [rememberError, setRememberError] = useState<string | null>(null);

  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<PreviousInvestigationItem[] | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);

  const handleRemember = async () => {
    setIsRemembering(true);
    setRememberError(null);

    try {
      const payload = {
        question: explanation.question,
        decision: explanation.decision,
        status: assessment?.status || explanation.status || 'REVIEW REQUIRED',
        reasons: explanation.reasons,
        changed_assumptions: assessment?.changed_assumptions || [],
        alternatives: explanation.alternatives?.map((a) => a.name) || [],
        evidence_ids: assessment?.source_documents || explanation.source_documents || [],
        impact_summary: assessment?.impact_summary || explanation.summary,
        confidence: assessment?.confidence || explanation.confidence,
        decision_id: explanation.decision_id || 'finflow-provider-x-europe',
      };

      const result = await rememberDecision(payload);
      setRememberedResponse(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retain investigation in Hindsight';
      setRememberError(msg);
    } finally {
      setIsRemembering(false);
    }
  };

  const handleToggleHistory = async () => {
    if (!showHistoryPanel && !historyItems) {
      setIsLoadingHistory(true);
      try {
        const res = await fetchDecisionHistory(explanation.question);
        setHistoryItems(res.investigations || []);
      } catch (err: unknown) {
        console.error('Failed to fetch decision history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    setShowHistoryPanel((prev) => !prev);
  };

  const priorCount = explanation.prior_investigations_count || 0;

  return (
    <div className="panel" style={{
      padding: '1.75rem',
      marginBottom: '2.5rem',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}>
            <BrainCircuit size={17} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                DECISION MEMORY
              </h3>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                Hindsight Evolution
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              WHY remembers organizational reasoning over time and builds compounding context.
            </div>
          </div>
        </div>

        {/* Buttons: Remember & View History */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {rememberedResponse ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#34d399',
            }}>
              <CheckCircle2 size={14} />
              <span>Remembered in Hindsight</span>
            </div>
          ) : (
            <button
              onClick={handleRemember}
              disabled={isRemembering}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
            >
              <Sparkles size={13} />
              <span>{isRemembering ? 'Retaining in Hindsight...' : 'Remember this investigation'}</span>
            </button>
          )}

          <button
            onClick={handleToggleHistory}
            disabled={isLoadingHistory}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
          >
            <History size={13} />
            <span>{isLoadingHistory ? 'Recalling...' : 'View remembered reasoning'}</span>
            {showHistoryPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Remember success or error message */}
      {rememberedResponse && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '6px',
          padding: '0.65rem 0.9rem',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <strong>✓ Remembered:</strong> WHY has stored this decision reasoning in Hindsight memory.
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              ({rememberedResponse.document_id})
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Memory Type: Decision Investigation
          </span>
        </div>
      )}

      {rememberError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '6px',
          padding: '0.65rem 0.9rem',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: '#f87171',
        }}>
          {rememberError}
        </div>
      )}

      {/* Description text */}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 0.85rem 0' }}>
        WHY can now use this completed investigation as reasoning context in future investigations. 
        Unlike standard retrieval which stores static documents, WHY accumulates decision reasoning memories 
        while enforcing strict epistemic hierarchy: <strong>primary organizational evidence always supersedes prior AI reasoning.</strong>
      </p>

      {/* Expandable: Previous WHY Investigations Panel */}
      {showHistoryPanel && (
        <div style={{
          marginTop: '1rem',
          padding: '1.25rem',
          backgroundColor: 'rgba(10, 15, 29, 0.8)',
          borderRadius: '8px',
          border: '1px solid var(--border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              PREVIOUS WHY INVESTIGATIONS ({historyItems ? historyItems.length : priorCount})
            </h4>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              Prior AI reasoning &bull; Not primary evidence
            </span>
          </div>

          {historyItems && historyItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {historyItems.map((inv, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {inv.decision}
                    </span>
                    <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>
                      {inv.status}
                    </span>
                  </div>

                  {inv.investigation_date && (
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      marginBottom: '0.4rem',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      <Calendar size={11} />
                      Investigated on: {inv.investigation_date} &bull; Confidence: {(inv.confidence * 100).toFixed(0)}%
                    </div>
                  )}

                  {inv.key_reasoning && inv.key_reasoning.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.4rem' }}>
                      <strong>Key Reasoning:</strong> {inv.key_reasoning.join('; ')}
                    </div>
                  )}

                  {inv.changed_assumptions && inv.changed_assumptions.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#fbbf24', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                      <strong>Invalidated Assumptions:</strong> {inv.changed_assumptions.join('; ')}
                    </div>
                  )}

                  {inv.evidence_ids && inv.evidence_ids.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Citations cited:</span>
                      {inv.evidence_ids.map((id) => (
                        <span key={id} className="badge-evidence" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                          {id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No prior investigations recorded in Hindsight yet. Click &ldquo;Remember this investigation&rdquo; above to retain the first one.
            </div>
          )}
        </div>
      )}

      {/* Developer / Demo Transparent Debug Panel */}
      <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <button
          onClick={() => setShowDebugPanel((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: 0,
          }}
        >
          <Info size={12} />
          <span>{showDebugPanel ? 'Hide Memory Context Inspection' : 'Inspect Memory Context Used (Judge & Demo View)'}</span>
          {showDebugPanel ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {showDebugPanel && (
          <div style={{
            marginTop: '0.6rem',
            padding: '0.75rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 15, 29, 0.6)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                Primary Evidence Recalled:
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#60a5fa' }}>
                {primaryEvidenceCount} records
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                Previous WHY Investigations Recalled:
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>
                {priorCount} prior memories
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                Epistemic Priority:
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
                Primary Evidence Supersedes AI Reasoning
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
