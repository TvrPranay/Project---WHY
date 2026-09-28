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
        letterSpacing: '0.04em',
        padding: '0.15rem 0.45rem',
        borderRadius: '4px',
        backgroundColor: isHigh ? '#fef2f2' : '#eff6ff',
        color: isHigh ? '#991b1b' : '#1d4ed8',
        border: `1px solid ${isHigh ? '#fecaca' : '#bfdbfe'}`,
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
        marginBottom: '0.85rem',
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Reason-by-Reason Temporal Invalidation
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Comparing original 2024 rationale points against subsequent 2025–2026 organizational evidence.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reasons.map((item, idx) => (
          <div
            key={idx}
            className="panel"
            style={{
              padding: '1.25rem',
              backgroundColor: '#ffffff',
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
              marginBottom: '0.85rem',
              paddingBottom: '0.65rem',
              borderBottom: '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                {getImpactBadge(item.impact)}
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Reason #{idx + 1}
                </span>
              </div>
              <div>
                {getSupportBadge(item.current_support)}
              </div>
            </div>

            {/* Grid comparing 2024 Historical Reason vs 2026 Assessment */}
            <div className="grid-two" style={{ gap: '1.25rem' }}>
              {/* Left Column: 2024 Historical Reason */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '0.9rem',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
              }}>
                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--accent-blue)',
                  marginBottom: '0.3rem',
                }}>
                  2024 Original Rationale:
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.65rem' }}>
                  {item.original_reason}
                </div>
                {item.original_evidence_ids.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Historical Citations:</span>
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
                  ? '#fef2f2'
                  : item.current_support === 'WEAKENED'
                  ? '#fffbeb'
                  : '#ecfdf5',
                padding: '0.9rem',
                borderRadius: '6px',
                border: `1px solid ${
                  item.current_support === 'INVALIDATED'
                    ? '#fecaca'
                    : item.current_support === 'WEAKENED'
                    ? '#fde68a'
                    : '#a7f3d0'
                }`,
              }}>
                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: item.current_support === 'INVALIDATED' ? '#991b1b' : '#92400e',
                  marginBottom: '0.3rem',
                }}>
                  Later Evidence & Assessment:
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.65rem' }}>
                  {item.assessment}
                </div>
                {item.new_evidence_ids.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>New Evidence Citations:</span>
                    {item.new_evidence_ids.map((docId) => (
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
