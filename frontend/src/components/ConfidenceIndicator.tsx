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
    if (val >= 0.85) return { label: 'High Confidence', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    if (val >= 0.65) return { label: 'Moderate Confidence', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
    if (val > 0) return { label: 'Partial Confidence', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
    return { label: 'Insufficient Evidence', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' };
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
          padding: '0.3rem 0.65rem',
          borderRadius: '6px',
          backgroundColor: level.bg,
          border: `1px solid ${level.color}40`,
          cursor: 'pointer',
        }}
      >
        <ShieldCheck size={14} style={{ color: level.color }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Evidence Confidence:
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: level.color }}>
          {percentage}%
        </span>
        <Info size={12} style={{ color: 'var(--text-muted)' }} />
      </div>

      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '120%',
          right: 0,
          width: '320px',
          backgroundColor: '#0f172a',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '0.75rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 30,
          fontSize: '0.75rem',
          lineHeight: 1.45,
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Evidence Confidence Heuristic
          </div>
          <p style={{ marginBottom: '0.4rem' }}>
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
