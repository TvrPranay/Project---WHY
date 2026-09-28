import React from 'react';
import { Calendar } from 'lucide-react';
import { DecisionAssessment, DecisionExplanation } from '../types/decision';

interface DecisionTimelineProps {
  explanation?: DecisionExplanation | null;
  assessment?: DecisionAssessment | null;
  onSelectDoc?: (docId: string) => void;
}

export const DecisionTimeline: React.FC<DecisionTimelineProps> = ({
  explanation,
  assessment,
  onSelectDoc,
}) => {
  if (!explanation) return null;

  return (
    <div className="panel" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Calendar size={16} style={{ color: 'var(--accent-blue)' }} />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Decision Lifecycle & Temporal Timeline
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        position: 'relative',
      }}>
        {/* Milestone 1: 2024 Decision Made */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '1.1rem',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: 'var(--accent-blue)',
              fontFamily: 'var(--font-mono)',
            }}>
              2024
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              Decision Adopted
            </span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Provider X Selected
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.65rem' }}>
            Selected for European card expansion due to French CB / Girocard licenses and legacy ISO 8583 pipeline.
          </p>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {['ADR-014', 'PAY-1042', 'SLACK-001'].map((doc) => (
              <span
                key={doc}
                className="badge-evidence"
                onClick={() => onSelectDoc && onSelectDoc(doc)}
              >
                {doc}
              </span>
            ))}
          </div>
        </div>

        {/* Milestone 2: 2025 Operational Evidence & Friction */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '1.1rem',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              2025
            </span>
            <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>
              Operational Evidence
            </span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Settlement SLA Breaches
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.65rem' }}>
            Provider X misses T+1 batch settlement windows; tech debt review highlights 13-month temporary adapter persistence.
          </p>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {['INC-2025-11', 'PR-412'].map((doc) => (
              <span
                key={doc}
                className="badge-evidence"
                onClick={() => onSelectDoc && onSelectDoc(doc)}
              >
                {doc}
              </span>
            ))}
          </div>
        </div>

        {/* Milestone 3: 2026 Environmental Changes */}
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '1.1rem',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#92400e',
              fontFamily: 'var(--font-mono)',
            }}>
              2026
            </span>
            <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>
              Assumptions Changed
            </span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Constraints Dissolved
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.65rem' }}>
            Apex Retail completes REST v2 migration; Provider Y obtains BaFin Girocard certification.
          </p>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {['PAY-3310', 'SLACK-005', 'ADR-028'].map((doc) => (
              <span
                key={doc}
                className="badge-evidence"
                onClick={() => onSelectDoc && onSelectDoc(doc)}
              >
                {doc}
              </span>
            ))}
          </div>
        </div>

        {/* Milestone 4: Present Audit Status */}
        {assessment && (
          <div style={{
            backgroundColor: assessment.status === 'REVIEW REQUIRED' ? '#fffbeb' : '#ecfdf5',
            border: `1px solid ${assessment.status === 'REVIEW REQUIRED' ? '#fde68a' : '#a7f3d0'}`,
            borderRadius: '8px',
            padding: '1.1rem',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: assessment.status === 'REVIEW REQUIRED' ? '#92400e' : '#065f46',
                fontFamily: 'var(--font-mono)',
              }}>
                NOW
              </span>
              <span className={`badge ${assessment.status === 'REVIEW REQUIRED' ? 'badge-review' : 'badge-active'}`} style={{ fontSize: '0.65rem' }}>
                {assessment.status}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              Temporal Audit
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Original constraints and justifications evaluated against 2025–2026 evidence records in Hindsight.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
