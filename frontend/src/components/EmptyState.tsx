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
        padding: '2.5rem',
        marginBottom: '2.5rem',
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid var(--border-default)',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.3rem 0.8rem',
          borderRadius: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
        }}>
          <Sparkles size={13} />
          The Organizational Decision Memory Layer
        </div>

        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.35,
          letterSpacing: '-0.025em',
          maxWidth: '750px',
          margin: '0 auto 1.25rem auto',
        }}>
          Most systems remember <span style={{ color: '#94a3b8' }}>WHAT</span> happened.<br />
          WHY remembers <span style={{ color: '#60a5fa' }}>WHY</span> it happened — and alerts you when that reasoning changes.
        </h2>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '720px',
          margin: '0 auto 2rem auto',
        }}>
          Every organization lives with decisions made years ago under constraints that no longer exist.
          WHY connects directly to <strong>Hindsight</strong> long-term memory to audit the longevity of past assumptions.
        </p>

        {/* Primary Sample CTA */}
        <button
          onClick={() => onSelectSample('Why did FinFlow choose Provider X for European card payments?')}
          className="btn btn-primary"
          style={{
            padding: '0.85rem 1.8rem',
            fontSize: '0.95rem',
            boxShadow: '0 4px 18px rgba(59, 130, 246, 0.4)',
          }}
        >
          <span>Launch Demo: European Card Gateway Decision</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 3 Pillars of Decision Intelligence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Pillar 1 */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <Database size={20} style={{ color: '#60a5fa' }} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
            Persistent Recall
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Recovers lost engineering and executive rationale from Slack threads, incident debriefs, Jira tickets, and architectural decision records.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <Clock size={20} style={{ color: '#fbbf24' }} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
            Temporal Reasoning
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Tracks decisions over chronological time. Correlates subsequent organizational events (2025–2026) directly against the original 2024 assumptions.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <ShieldAlert size={20} style={{ color: '#f87171' }} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
            Automatic Invalidation
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Detects when foundational premises are overturned — whether by vendor regulatory milestones, deprecated APIs, or SLA breaches.
          </p>
        </div>
      </div>
    </div>
  );
};
