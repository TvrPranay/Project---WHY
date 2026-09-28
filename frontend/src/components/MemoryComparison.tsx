import React from 'react';
import {
  ArrowRight,
  Database,
  HelpCircle,
  Sparkles,
  X
} from 'lucide-react';
import { DecisionExplanation, MemoryComparisonResponse } from '../types/decision';

interface MemoryComparisonProps {
  comparison: MemoryComparisonResponse;
  onContinueTemporal: (explanation: DecisionExplanation) => void;
  onClose: () => void;
}

export const MemoryComparison: React.FC<MemoryComparisonProps> = ({
  comparison,
  onContinueTemporal,
  onClose,
}) => {
  const { without_memory, with_hindsight } = comparison;

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Top Banner / Heading */}
      <div className="panel" style={{
        padding: '1.5rem 1.75rem',
        marginBottom: '1.75rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.15rem 0.55rem',
              borderRadius: '4px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: 'var(--accent-blue)',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}>
              <Sparkles size={11} />
              Controlled Memory Demonstration
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Why Memory Matters
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
              The same question, investigated with and without persistent organizational memory.
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <X size={13} />
            <span>Close Comparison</span>
          </button>
        </div>

        {/* Investigated Question Quote */}
        <div style={{
          marginTop: '1rem',
          padding: '0.65rem 0.85rem',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid var(--border-default)',
          fontSize: '0.84rem',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Investigated Question: </span>
          &ldquo;{comparison.question}&rdquo;
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid-two" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        {/* LEFT PANEL: WITHOUT HINDSIGHT */}
        <div className="panel" style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              paddingBottom: '0.65rem',
              borderBottom: '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <HelpCircle size={17} style={{ color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  WITHOUT HINDSIGHT
                </h3>
              </div>
              <span className="badge badge-subtle" style={{ fontSize: '0.68rem' }}>
                {without_memory.status}
              </span>
            </div>

            {/* Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              padding: '0.65rem',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Evidence Recalled</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{without_memory.evidence_count}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prior Investigations</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{without_memory.prior_investigations_count}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Citations</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{without_memory.citation_count}</div>
              </div>
            </div>

            {/* Decision Statement */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Reconstruction Result:
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {without_memory.explanation.decision}
              </div>
            </div>

            {/* Summary / Refusal Rationale */}
            <div style={{
              padding: '0.85rem',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              {without_memory.explanation.summary}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Without organizational memory, the AI agent has no record of the French CB license requirements,
              German Girocard certifications, or Apex Retail ISO 8583 settlement dependencies that took place in 2024.
            </div>
          </div>

          <div style={{
            marginTop: '1.25rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-default)',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
          }}>
            Status: <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Honest Refusal (Zero Hallucination)</span>
          </div>
        </div>

        {/* RIGHT PANEL: WITH HINDSIGHT */}
        <div className="panel" style={{
          padding: '1.5rem',
          backgroundColor: '#ffffff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              paddingBottom: '0.65rem',
              borderBottom: '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Database size={17} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-blue)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  WITH HINDSIGHT MEMORY
                </h3>
              </div>
              <span className="badge badge-active" style={{ fontSize: '0.68rem' }}>
                {with_hindsight.status}
              </span>
            </div>

            {/* Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              padding: '0.65rem',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Evidence Recalled</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{with_hindsight.evidence_count}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prior Investigations</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e' }}>{with_hindsight.prior_investigations_count}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Citations</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#065f46' }}>{with_hindsight.citation_count}</div>
              </div>
            </div>

            {/* Decision Statement */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '0.25rem' }}>
                Reconstructed Decision:
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {with_hindsight.explanation.decision}
              </div>
            </div>

            {/* Reconstructed Reasons */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Key Rationales (Authoritative Sources):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {with_hindsight.explanation.reasons.map((r, idx) => (
                  <div key={idx} style={{
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.45,
                  }}>
                    <div>{r.reason}</div>
                    {r.evidence_ids && r.evidence_ids.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                        {r.evidence_ids.map((id) => (
                          <span key={id} className="badge-evidence" style={{ fontSize: '0.65rem' }}>
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alternatives Considered */}
            {with_hindsight.explanation.alternatives && with_hindsight.explanation.alternatives.length > 0 && (
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Alternatives Considered:
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {with_hindsight.explanation.alternatives.map((a) => a.name).join(', ')} (rejected due to domestic licensing or protocol constraints).
                </div>
              </div>
            )}
          </div>

          {/* Hindsight Bank Context & Continue CTA */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Bank: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{with_hindsight.bank_id || 'finflow-why'}</span>
            </div>

            <button
              onClick={() => onContinueTemporal(with_hindsight.explanation)}
              className="btn"
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                border: '1px solid #b45309',
                fontSize: '0.78rem',
                padding: '0.4rem 0.85rem',
                fontWeight: 600,
              }}
            >
              <span>Continue with temporal analysis</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Memory Flow Visualization */}
      <div className="panel" style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
      }}>
        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          Memory Flow Architecture
        </h4>

        <div className="grid-two" style={{ gap: '1.25rem' }}>
          {/* Flow Without Memory */}
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid var(--border-default)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
              WITHOUT MEMORY PIPELINE:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <span>Question</span>
              <span>&rarr;</span>
              <span>No Context</span>
              <span>&rarr;</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Insufficient Evidence</span>
            </div>
          </div>

          {/* Flow With Hindsight */}
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
              WITH HINDSIGHT PIPELINE:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <span>Question</span>
              <span>&rarr;</span>
              <span style={{ color: 'var(--accent-blue)' }}>Hindsight Recall</span>
              <span>&rarr;</span>
              <span>Evidence + Prior Memory</span>
              <span>&rarr;</span>
              <span style={{ color: '#065f46', fontWeight: 700 }}>Decision Reconstructed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
