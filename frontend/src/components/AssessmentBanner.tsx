import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, HelpCircle, RefreshCw } from 'lucide-react';
import { DecisionAssessment, DecisionStatus } from '../types/decision';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface AssessmentBannerProps {
  assessment: DecisionAssessment;
  onReassess?: () => void;
  isAssessing?: boolean;
}

export const AssessmentBanner: React.FC<AssessmentBannerProps> = ({
  assessment,
  onReassess,
  isAssessing,
}) => {
  const getStatusConfig = (status: DecisionStatus) => {
    switch (status) {
      case 'REVIEW REQUIRED':
        return {
          icon: <AlertTriangle size={22} style={{ color: '#d97706' }} />,
          label: 'REVIEW REQUIRED',
          badgeClass: 'badge-review',
          bg: '#fffbeb',
          borderColor: '#fde68a',
          textColor: '#92400e',
        };
      case 'ACTIVE':
        return {
          icon: <CheckCircle2 size={22} style={{ color: '#059669' }} />,
          label: 'ACTIVE',
          badgeClass: 'badge-active',
          bg: '#ecfdf5',
          borderColor: '#a7f3d0',
          textColor: '#065f46',
        };
      case 'STALE':
        return {
          icon: <AlertOctagon size={22} style={{ color: '#64748b' }} />,
          label: 'STALE',
          badgeClass: 'badge-subtle',
          bg: '#f8fafc',
          borderColor: '#e2e8f0',
          textColor: '#475569',
        };
      case 'CONFLICTED':
        return {
          icon: <AlertTriangle size={22} style={{ color: '#dc2626' }} />,
          label: 'CONFLICTED',
          badgeClass: 'badge-invalidated',
          bg: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#991b1b',
        };
      default:
        return {
          icon: <HelpCircle size={22} style={{ color: '#64748b' }} />,
          label: 'INSUFFICIENT EVIDENCE',
          badgeClass: 'badge-subtle',
          bg: '#f8fafc',
          borderColor: '#e2e8f0',
          textColor: '#475569',
        };
    }
  };

  const config = getStatusConfig(assessment.status);

  // Compute how many high-impact reasons changed
  const highImpactChangedCount = assessment.affected_reasons.filter(
    (r) => r.impact === 'HIGH' && (r.current_support === 'INVALIDATED' || r.current_support === 'WEAKENED')
  ).length;

  return (
    <div
      className="panel"
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.borderColor}`,
        marginBottom: '2rem',
        padding: '1.5rem',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '0.85rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {config.icon}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: config.textColor,
              }}>
                {config.label}
              </span>
              <span className={`badge ${config.badgeClass}`} style={{ fontSize: '0.68rem' }}>
                Temporal Assessment
              </span>
            </div>
            {highImpactChangedCount > 0 && (
              <div style={{
                fontSize: '0.86rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '0.2rem',
              }}>
                {highImpactChangedCount} high-impact {highImpactChangedCount === 1 ? 'assumption' : 'assumptions'} behind the original decision {highImpactChangedCount === 1 ? 'has' : 'have'} changed.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ConfidenceIndicator
            confidence={assessment.confidence}
            rationale={assessment.confidence_rationale}
          />
          {onReassess && (
            <button
              onClick={onReassess}
              disabled={isAssessing}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              title="Refresh temporal assessment against Hindsight"
            >
              <RefreshCw size={12} className={isAssessing ? 'pulsing-dot' : ''} />
              <span>{isAssessing ? 'Assessing...' : 'Re-check'}</span>
            </button>
          )}
        </div>
      </div>

      <p style={{
        fontSize: '0.92rem',
        color: 'var(--text-primary)',
        lineHeight: 1.6,
        marginBottom: '0.85rem',
      }}>
        {assessment.impact_summary}
      </p>

      {assessment.changed_assumptions.length > 0 && (
        <div style={{
          marginTop: '0.85rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid var(--border-default)',
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            marginBottom: '0.35rem',
          }}>
            Changed / Invalidated Assumptions:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
            {assessment.changed_assumptions.map((ca, idx) => (
              <li key={idx} style={{ marginBottom: '0.2rem' }}>{ca}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
