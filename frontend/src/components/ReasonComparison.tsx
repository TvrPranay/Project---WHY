import React from 'react';
import { ReasonAssessment } from '../types/decision';

interface ReasonComparisonProps {
  reasons: ReasonAssessment[];
  onSelectDoc?: (docId: string) => void;
}

export const ReasonComparison: React.FC<ReasonComparisonProps> = ({
  reasons,
  onSelectDoc,
}) => {
  if (!reasons || reasons.length === 0) {
    return null;
  }

  const getSupportBadge = (support: string) => {
    switch (support) {
      case 'INVALIDATED':
        return <span className="badge badge-invalidated">INVALIDATED</span>;
      case 'WEAKENED':
        return <span className="badge badge-review">WEAKENED</span>;
      case 'STILL_SUPPORTED':
        return <span className="badge badge-active">STILL SUPPORTED</span>;
      case 'CONFLICTED':
        return <span className="badge badge-invalidated">CONFLICTED</span>;
      default:
        return <span className="badge badge-subtle">{support}</span>;
    }
  };

  const getImpactBadge = (impact: string) => {
    const isHigh = impact === 'HIGH';
    return (
      <span style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '0.15rem 0.45rem',
        borderRadius: '4px',
        backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
        color: isHigh ? '#f87171' : '#60a5fa',
        border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
      }}>
        {impact} IMPACT
      </span>
    );
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Reason-by-Reason Temporal Invalidation
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Comparing original 2024 rationale points against new 2026 organizational evidence.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {reasons.map((item, idx) => (
          <div
            key={idx}
            className="panel"
            style={{
              padding: '1.4rem',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: item.current_support === 'INVALIDATED'
                ? '4px solid var(--status-invalidated)'
                : item.current_support === 'WEAKENED'
                ? '4px solid var(--status-review)'
                : '4px solid var(--status-active)',
            }}
          >
            {/* Header: Impact & Support Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {getImpactBadge(item.impact)}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Reason #{idx + 1}
                </span>
              </div>
              <div>
                {getSupportBadge(item.current_support)}
              </div>
            </div>

            {/* Grid comparing 2024 Historical Reason vs 2026 Assessment */}
            <div className="grid-two" style={{ gap: '1.5rem' }}>
              {/* Left Column: 2024 Historical Reason */}
              <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#60a5fa',
                  marginBottom: '0.35rem',
                }}>
                  2024 Original Rationale:
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {item.original_reason}
                </div>
                {item.original_evidence_ids.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Historical Citations:</span>
                    {item.original_evidence_ids.map((docId) => (
                      <span
                        key={docId}
                        className="badge-evidence"
                        onClick={() => onSelectDoc && onSelectDoc(docId)}
                        title="View citation in Evidence Trail"
                      >
                        {docId}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: 2026 Later Evidence / What Changed */}
              <div style={{
                backgroundColor: item.current_support === 'INVALIDATED'
                  ? 'rgba(244, 63, 94, 0.06)'
                  : 'rgba(245, 158, 11, 0.06)',
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${item.current_support === 'INVALIDATED' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: item.current_support === 'INVALIDATED' ? '#fb7185' : '#fbbf24',
                  marginBottom: '0.35rem',
                }}>
                  2026 Evidence & Assessment:
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {item.assessment}
                </div>
                {item.new_evidence_ids.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>New Evidence Citations:</span>
                    {item.new_evidence_ids.map((docId) => (
                      <span
                        key={docId}
                        className="badge-evidence"
                        style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.35)' }}
                        onClick={() => onSelectDoc && onSelectDoc(docId)}
                        title="View citation in Evidence Trail"
                      >
                        {docId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
