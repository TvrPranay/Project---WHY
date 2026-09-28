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
          icon: <AlertTriangle size={24} style={{ color: '#f59e0b' }} />,
          label: 'REVIEW REQUIRED',
          badgeClass: 'badge-review',
          bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.1) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.4)',
          textColor: '#fbbf24',
        };
      case 'ACTIVE':
        return {
          icon: <CheckCircle2 size={24} style={{ color: '#10b981' }} />,
          label: 'ACTIVE',
          badgeClass: 'badge-active',
          bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.4)',
          textColor: '#34d399',
        };
      case 'STALE':
        return {
          icon: <AlertOctagon size={24} style={{ color: '#94a3b8' }} />,
          label: 'STALE',
          badgeClass: 'badge-subtle',
          bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, rgba(71, 85, 105, 0.1) 100%)',
          borderColor: 'rgba(148, 163, 184, 0.35)',
          textColor: '#cbd5e1',
        };
      case 'CONFLICTED':
        return {
          icon: <AlertTriangle size={24} style={{ color: '#ef4444' }} />,
          label: 'CONFLICTED',
          badgeClass: 'badge-invalidated',
          bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)',
          borderColor: 'rgba(239, 68, 68, 0.4)',
          textColor: '#f87171',
        };
      default:
        return {
          icon: <HelpCircle size={24} style={{ color: '#64748b' }} />,
          label: 'INSUFFICIENT EVIDENCE',
          badgeClass: 'badge-subtle',
          bg: 'rgba(30, 41, 59, 0.6)',
          borderColor: 'var(--border-default)',
          textColor: '#94a3b8',
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
        background: config.bg,
        border: `1px solid ${config.borderColor}`,
        marginBottom: '2rem',
        padding: '1.75rem',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {config.icon}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: config.textColor,
              }}>
                {config.label}
              </span>
              <span className={`badge ${config.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                Temporal Invalidation Status
              </span>
            </div>
            {highImpactChangedCount > 0 && (
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '0.2rem',
              }}>
                {highImpactChangedCount} high-impact {highImpactChangedCount === 1 ? 'assumption' : 'assumptions'} behind the original decision {highImpactChangedCount === 1 ? 'has' : 'have'} changed.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ConfidenceIndicator
            confidence={assessment.confidence}
            rationale={assessment.confidence_rationale}
          />
          {onReassess && (
            <button
              onClick={onReassess}
              disabled={isAssessing}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
              title="Refresh temporal assessment against Hindsight"
            >
              <RefreshCw size={13} className={isAssessing ? 'pulsing-dot' : ''} />
              <span>{isAssessing ? 'Assessing...' : 'Re-check'}</span>
            </button>
          )}
        </div>
      </div>

      <p style={{
        fontSize: '0.95rem',
        color: 'var(--text-primary)',
        lineHeight: 1.6,
        marginBottom: '1rem',
      }}>
        {assessment.impact_summary}
      </p>

      {assessment.changed_assumptions.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            marginBottom: '0.4rem',
          }}>
            Invalidated / Altered Assumptions:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {assessment.changed_assumptions.map((ca, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>{ca}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
