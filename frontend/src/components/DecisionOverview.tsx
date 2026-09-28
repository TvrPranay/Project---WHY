import React from 'react';
import { 
  FileText, 
  Users, 
  Layers, 
  ArrowRight,
  GitBranch,
  Zap
} from 'lucide-react';
import { DecisionExplanation } from '../types/decision';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface DecisionOverviewProps {
  explanation: DecisionExplanation;
  onAssess: () => void;
  isAssessing: boolean;
  hasAssessment: boolean;
  onSelectDoc?: (docId: string) => void;
}

export const DecisionOverview: React.FC<DecisionOverviewProps> = ({
  explanation,
  onAssess,
  isAssessing,
  hasAssessment,
  onSelectDoc,
}) => {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Primary Decision Card */}
      <div className="panel" style={{ padding: '2rem', marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-info">Reconstructed Decision</span>
              {explanation.decision_id && (
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  ID: {explanation.decision_id}
                </span>
              )}
            </div>
            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              lineHeight: 1.3,
            }}>
              {explanation.decision}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ConfidenceIndicator 
              confidence={explanation.confidence} 
              rationale={explanation.confidence_rationale} 
            />
          </div>
        </div>

        {/* Executive Summary */}
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          marginBottom: '1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.25rem',
        }}>
          {explanation.summary}
        </p>

        {/* Why this decision was made: Reasons Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <FileText size={15} style={{ color: '#60a5fa' }} />
            Key Supporting Reasons
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {explanation.reasons.map((r, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  {r.reason}
                </div>
                {r.evidence_ids && r.evidence_ids.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flexWrap: 'wrap',
                    paddingTop: '0.6rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Citations:</span>
                    {r.evidence_ids.map((id) => (
                      <span
                        key={id}
                        className="badge-evidence"
                        onClick={() => onSelectDoc && onSelectDoc(id)}
                        title={`Click to view document ${id}`}
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Grid: Alternatives Considered & Constraints */}
        <div className="grid-two" style={{ gap: '1.5rem', marginBottom: '1.75rem' }}>
          {/* Alternatives */}
          <div>
            <h3 style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <GitBranch size={14} style={{ color: '#94a3b8' }} />
              Alternatives Considered
            </h3>

            {explanation.alternatives && explanation.alternatives.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {explanation.alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {alt.name}
                      </span>
                      <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>
                        Rejected / Deferred
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {alt.reason_not_selected}
                    </div>
                    {alt.evidence_ids && alt.evidence_ids.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {alt.evidence_ids.map((id) => (
                          <span
                            key={id}
                            className="badge-evidence"
                            onClick={() => onSelectDoc && onSelectDoc(id)}
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No explicit alternatives recorded.
              </div>
            )}
          </div>

          {/* Constraints & Dependencies */}
          <div>
            <h3 style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <Layers size={14} style={{ color: '#94a3b8' }} />
              Constraints & Context
            </h3>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.85rem',
              marginBottom: '0.75rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Constraints:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                {explanation.constraints && explanation.constraints.length > 0 ? (
                  explanation.constraints.map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{c}</li>
                  ))
                ) : (
                  <li>Standard enterprise compliance and legacy pipeline backward compatibility.</li>
                )}
              </ul>
            </div>

            {explanation.participants && explanation.participants.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.85rem',
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}>
                  <Users size={12} />
                  Key Participants:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {explanation.participants.map((person, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Call to Action: Invalidation Analysis */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <Zap size={16} style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                Temporal Reasoning & Invalidation Engine
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Evaluate later organizational signals (2025–2026) against these historical rationales to verify ongoing validity.
            </div>
          </div>

          <button
            onClick={onAssess}
            disabled={isAssessing}
            className="btn btn-warning"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
            }}
          >
            {isAssessing ? (
              <span>Evaluating Later Evidence...</span>
            ) : hasAssessment ? (
              <>
                <span>Re-check Reasoning Validity</span>
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <span>Check if this reasoning still holds</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
