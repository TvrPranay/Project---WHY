import React from 'react';
import {
  FileText,
  Users,
  Layers,
  ArrowRight,
  GitBranch,
  Clock
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
      <div className="panel" style={{ padding: '1.75rem', marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-info">Reconstructed Decision</span>
              {explanation.decision_id && (
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  ID: {explanation.decision_id}
                </span>
              )}
            </div>
            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.35,
            }}>
              {explanation.decision}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ConfidenceIndicator
              confidence={explanation.confidence}
              rationale={explanation.confidence_rationale}
            />
          </div>
        </div>

        {/* Executive Summary */}
        <p style={{
          fontSize: '0.94rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: '1.25rem',
        }}>
          {explanation.summary}
        </p>

        {/* Why this decision was made: Reasons Section */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}>
            <FileText size={14} style={{ color: 'var(--accent-blue)' }} />
            Key Supporting Reasons
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
            {explanation.reasons.map((r, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {r.reason}
                </div>
                {r.evidence_ids && r.evidence_ids.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    flexWrap: 'wrap',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-default)',
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
        <div className="grid-two" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Alternatives */}
          <div>
            <h3 style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
              marginBottom: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <GitBranch size={13} style={{ color: 'var(--text-muted)' }} />
              Alternatives Considered
            </h3>

            {explanation.alternatives && explanation.alternatives.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {explanation.alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      padding: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                        {alt.name}
                      </span>
                      <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>
                        Rejected / Deferred
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {alt.reason_not_selected}
                    </div>
                    {alt.evidence_ids && alt.evidence_ids.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
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
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                No explicit alternatives recorded.
              </div>
            )}
          </div>

          {/* Constraints & Dependencies */}
          <div>
            <h3 style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
              marginBottom: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <Layers size={13} style={{ color: 'var(--text-muted)' }} />
              Constraints & Context
            </h3>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '0.8rem',
              marginBottom: '0.65rem',
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Constraints:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {explanation.constraints && explanation.constraints.length > 0 ? (
                  explanation.constraints.map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>{c}</li>
                  ))
                ) : (
                  <li>Standard enterprise compliance and legacy pipeline backward compatibility.</li>
                )}
              </ul>
            </div>

            {explanation.participants && explanation.participants.length > 0 && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                padding: '0.8rem',
              }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}>
                  <Users size={12} />
                  Key Participants:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {explanation.participants.map((person, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-default)',
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
          marginTop: '1.25rem',
          padding: '1.1rem 1.25rem',
          borderRadius: '8px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <Clock size={15} style={{ color: '#d97706' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e' }}>
                Temporal Reasoning & Decision Audit
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78350f' }}>
              Evaluate subsequent organizational evidence (2025–2026) against these historical rationales to verify ongoing validity.
            </div>
          </div>

          <button
            onClick={onAssess}
            disabled={isAssessing}
            className="btn"
            style={{
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: '1px solid #b45309',
              padding: '0.6rem 1.25rem',
              fontSize: '0.84rem',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            {isAssessing ? (
              <span>Evaluating Later Evidence...</span>
            ) : hasAssessment ? (
              <>
                <span>Re-check Reasoning Validity</span>
                <ArrowRight size={14} />
              </>
            ) : (
              <>
                <span>Check if this reasoning still holds</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
