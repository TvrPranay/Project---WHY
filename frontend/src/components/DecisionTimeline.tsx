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
    <div className="panel" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <Calendar size={18} style={{ color: '#60a5fa' }} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Decision Lifecycle & Invalidation Timeline
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem',
        position: 'relative',
      }}>
        {/* Milestone 1: 2024 Decision Made */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
          padding: '1.25rem',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#60a5fa',
              fontFamily: 'var(--font-mono)',
            }}>
              2024
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              Decision Adopted
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Provider X Selected
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
            Selected for European card expansion due to French CB / Girocard licenses and legacy ISO 8583 pipeline.
          </p>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
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
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: '10px',
          padding: '1.25rem',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#94a3b8',
              fontFamily: 'var(--font-mono)',
            }}>
              2025
            </span>
            <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>
              Operational Friction
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Settlement SLA Breaches
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
            Provider X misses T+1 batch settlement windows; tech debt review highlights 13-month temporary adapter persistence.
          </p>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['INC-2025-11', 'ARCH-2025-08', 'SLACK-004'].map((doc) => (
              <span
                key={doc}
                className="badge-evidence"
                style={{ backgroundColor: 'rgba(148, 163, 184, 0.12)', color: '#cbd5e1', borderColor: 'rgba(148, 163, 184, 0.3)' }}
                onClick={() => onSelectDoc && onSelectDoc(doc)}
              >
                {doc}
              </span>
            ))}
          </div>
        </div>

        {/* Milestone 3: 2026 Invalidation Signals & Review */}
        <div style={{
          backgroundColor: assessment
            ? 'rgba(245, 158, 11, 0.08)'
            : 'rgba(15, 23, 42, 0.7)',
          border: `1px solid ${assessment ? 'rgba(245, 158, 11, 0.4)' : 'rgba(148, 163, 184, 0.25)'}`,
          borderRadius: '10px',
          padding: '1.25rem',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: assessment ? '#fbbf24' : '#94a3b8',
              fontFamily: 'var(--font-mono)',
            }}>
              2026
            </span>
            {assessment ? (
              <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>
                {assessment.status}
              </span>
            ) : (
              <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>
                Assessing Signals...
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Assumptions Disrupted
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
            Provider Y receives BaFin regulatory approval; Apex Retail finishes REST v2 migration, removing the ISO 8583 dependency.
          </p>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['SLACK-005', 'PAY-3310', 'ADR-028'].map((doc) => (
              <span
                key={doc}
                className="badge-evidence"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.35)' }}
                onClick={() => onSelectDoc && onSelectDoc(doc)}
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
