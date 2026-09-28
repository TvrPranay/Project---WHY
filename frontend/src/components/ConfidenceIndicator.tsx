import React, { useState } from 'react';
import { Info, ShieldCheck } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number; // 0.0 to 1.0
  rationale?: string | null;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  rationale,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = Math.round(confidence * 100);

  const getConfidenceLevel = (val: number) => {
    if (val >= 0.85) return { label: 'High Confidence', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
    if (val >= 0.65) return { label: 'Moderate Confidence', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' };
    if (val > 0) return { label: 'Partial Confidence', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    return { label: 'Insufficient Evidence', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
  };

  const level = getConfidenceLevel(confidence);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '6px',
          backgroundColor: level.bg,
          border: `1px solid ${level.border}`,
          cursor: 'pointer',
        }}
      >
        <ShieldCheck size={14} style={{ color: level.color }} />
        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Evidence Confidence:
        </span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: level.color }}>
          {percentage}%
        </span>
        <Info size={12} style={{ color: 'var(--text-muted)' }} />
      </div>

      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '125%',
          right: 0,
          width: '320px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '0.75rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          zIndex: 30,
          fontSize: '0.75rem',
          lineHeight: 1.45,
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Evidence Confidence Heuristic
          </div>
          <p style={{ marginBottom: '0.35rem' }}>
            {rationale || 'Score is calculated based on source diversity, citation coverage across records, and consistency without conflicting statements.'}
          </p>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Transparent evidence metric: not an ungrounded ML probability.
          </div>
        </div>
      )}
    </div>
  );
};
