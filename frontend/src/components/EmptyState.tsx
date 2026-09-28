import React from 'react';
import { Sparkles, Clock, ShieldAlert, ArrowRight, Database } from 'lucide-react';

interface EmptyStateProps {
  onSelectSample: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSample }) => {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto 4rem auto' }}>
      {/* Product Mission Statement Card */}
      <div className="panel" style={{
        padding: '2.25rem',
        marginBottom: '2rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.65rem',
          borderRadius: '4px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: 'var(--accent-blue)',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.85rem',
        }}>
          <Sparkles size={12} />
          Organizational Decision Memory Layer
        </div>

        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.35,
          letterSpacing: '-0.02em',
          maxWidth: '720px',
          margin: '0 auto 1rem auto',
        }}>
          Most systems remember <span style={{ color: 'var(--text-muted)' }}>WHAT</span> happened.<br />
          WHY remembers <span style={{ color: 'var(--accent-blue)' }}>WHY</span> it happened — and audits when foundational reasoning changes.
        </h2>

        <p style={{
          fontSize: '0.92rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: '0 auto 1.75rem auto',
        }}>
          Engineering organizations often operate under constraints accepted years ago that have quietly expired.
          WHY connects directly to <strong>Hindsight</strong> persistent memory to reconstruct past reasoning and audit ongoing validity.
        </p>

        {/* Primary Sample CTA */}
        <button
          onClick={() => onSelectSample('Why did FinFlow choose Provider X for European card payments?')}
          className="btn btn-primary"
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
          }}
        >
          <span>Launch Demo: European Card Gateway Decision</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* 3 Pillars of Decision Intelligence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Pillar 1 */}
        <div className="panel" style={{ padding: '1.4rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.85rem',
          }}>
            <Database size={18} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Persistent Recall
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Recovers engineering and architecture rationale from Slack threads, incident debriefs, Jira tickets, and decision records.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="panel" style={{ padding: '1.4rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.85rem',
          }}>
            <Clock size={18} style={{ color: '#d97706' }} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Temporal Reasoning
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Tracks decisions over chronological time. Correlates subsequent organizational events (2025–2026) directly against 2024 assumptions.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="panel" style={{ padding: '1.4rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.85rem',
          }}>
            <ShieldAlert size={18} style={{ color: '#dc2626' }} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Decision Invalidation
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Detects when foundational premises dissolve — whether through vendor regulatory licensing, deprecated protocols, or SLA breaches.
          </p>
        </div>
      </div>
    </div>
  );
};
