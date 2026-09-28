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
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
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
              gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.65rem',
            }}>
              <Sparkles size={12} />
              Controlled Memory Demonstration
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', margin: 0 }}>
              Why Memory Matters
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: 0 }}>
              The same question, investigated with and without persistent organizational memory.
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <X size={14} />
            <span>Close Comparison</span>
          </button>
        </div>

        {/* Investigated Question Quote */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(10, 15, 29, 0.7)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.88rem',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Investigated Question: </span>
          &ldquo;{comparison.question}&rdquo;
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid-two" style={{ gap: '1.75rem', marginBottom: '2.5rem' }}>
        {/* LEFT PANEL: WITHOUT HINDSIGHT */}
        <div className="panel" style={{
          padding: '1.75rem',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
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
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={18} style={{ color: '#94a3b8' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
              padding: '0.75rem',
              backgroundColor: 'rgba(10, 15, 29, 0.5)',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Evidence</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94a3b8' }}>0</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prior Investigations</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94a3b8' }}>0</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Citations</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94a3b8' }}>0</div>
              </div>
            </div>

            {/* Explanation / Narrative */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(30, 41, 59, 0.3)',
              borderRadius: '8px',
              border: '1px dashed rgba(148, 163, 184, 0.3)',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Investigation Outcome:
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {without_memory.explanation.summary}
              </p>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Without organizational memory, the AI agent has no record of the French CB license requirements, 
              German Girocard certifications, or Apex Retail ISO 8583 settlement dependencies that took place in 2024. 
              It cannot reconstruct the decision without fabricating or hallucinating history.
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
          }}>
            Epistemic boundary: System honestly reports lack of evidence rather than generating unverified assumptions.
          </div>
        </div>

        {/* RIGHT PANEL: WITH HINDSIGHT */}
        <div className="panel" style={{
          padding: '1.75rem',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.08)',
        }}>
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={18} style={{ color: '#60a5fa' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
              padding: '0.75rem',
              backgroundColor: 'rgba(10, 15, 29, 0.7)',
              borderRadius: '6px',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Evidence Recalled</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa' }}>{with_hindsight.evidence_count}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prior Investigations</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>{with_hindsight.prior_investigations_count}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Citations</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{with_hindsight.citation_count}</div>
              </div>
            </div>

            {/* Decision Statement */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#60a5fa', marginBottom: '0.35rem' }}>
                Reconstructed Decision:
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.4 }}>
                {with_hindsight.explanation.decision}
              </div>
            </div>

            {/* Reconstructed Reasons */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                Key Rationales (Authoritative Sources):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {with_hindsight.explanation.reasons.map((r, idx) => (
                  <div key={idx} style={{
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'rgba(10, 15, 29, 0.6)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.45,
                  }}>
                    <div>{r.reason}</div>
                    {r.evidence_ids && r.evidence_ids.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
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
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Alternatives Considered:
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {with_hindsight.explanation.alternatives.map((a) => a.name).join(', ')} (rejected due to missing domestic licenses or protocol incompatibilities).
                </div>
              </div>
            )}
          </div>

          {/* Hindsight Bank Context & Continue CTA */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Bank: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{with_hindsight.bank_id || 'finflow-why'}</span>
            </div>

            <button
              onClick={() => onContinueTemporal(with_hindsight.explanation)}
              className="btn btn-warning"
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 1rem',
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
              }}
            >
              <span>Continue with temporal analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Memory Flow Visualization */}
      <div className="panel" style={{
        padding: '1.5rem 1.75rem',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid var(--border-subtle)',
      }}>
        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Memory Flow Architecture
        </h4>

        <div className="grid-two" style={{ gap: '1.5rem' }}>
          {/* Flow Without Memory */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(10, 15, 29, 0.6)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              WITHOUT MEMORY PIPELINE:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              <span>Question</span>
              <span>&rarr;</span>
              <span>No Context</span>
              <span>&rarr;</span>
              <span style={{ color: '#94a3b8', fontWeight: 700 }}>Insufficient Evidence</span>
            </div>
          </div>

          {/* Flow With Hindsight */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(10, 15, 29, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '0.5rem' }}>
              WITH HINDSIGHT PIPELINE:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              <span>Question</span>
              <span>&rarr;</span>
              <span style={{ color: '#60a5fa' }}>Hindsight Recall</span>
              <span>&rarr;</span>
              <span>Evidence + Prior Memory</span>
              <span>&rarr;</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>Decision Reconstructed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
