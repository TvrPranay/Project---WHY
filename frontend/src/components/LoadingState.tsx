import React, { useEffect, useState } from 'react';
import { Database, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  type: 'reconstruct' | 'assess';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const reconstructSteps = [
    { title: 'Connecting to Hindsight Memory Bank', detail: 'Target: finflow-why long-term organizational bank' },
    { title: 'Recalling Historical Evidence', detail: 'Searching ADRs, Jira tickets, Slack threads, and incident logs' },
    { title: 'Reconstructing Rationale & Alternatives', detail: 'Synthesizing decision context, participants, and trade-offs' },
  ];

  const assessSteps = [
    { title: 'Querying Temporal Memory', detail: 'Retrieving subsequent signals and operational events (2025–2026)' },
    { title: 'Comparing Assumptions Against Reality', detail: 'Evaluating settlement SLAs, regulatory approvals, and tech debt' },
    { title: 'Detecting Invalidated Reasoning', detail: 'Calculating impact ratings and confidence heuristics' },
  ];

  const steps = type === 'reconstruct' ? reconstructSteps : assessSteps;

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1200);
    const timer2 = setTimeout(() => setCurrentStep(2), 2600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [type]);

  return (
    <div className="panel" style={{
      padding: '3rem 2rem',
      maxWidth: '680px',
      margin: '0 auto 3rem auto',
      textAlign: 'center',
      border: '1px solid var(--border-default)',
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        marginBottom: '1.25rem',
      }}>
        {type === 'reconstruct' ? (
          <Database size={26} style={{ color: '#60a5fa' }} />
        ) : (
          <BrainCircuit size={26} style={{ color: '#fbbf24' }} />
        )}
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
        {type === 'reconstruct' ? 'Reconstructing Decision Memory' : 'Evaluating Temporal Invalidation'}
      </h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {type === 'reconstruct'
          ? 'Interrogating Hindsight persistent bank for historical reasoning and constraints...'
          : 'Analyzing organizational shifts across time to identify invalidated assumptions...'}
      </p>

      {/* Progress Step List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        textAlign: 'left',
        maxWidth: '460px',
        margin: '0 auto',
      }}>
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                border: isCurrent ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-subtle)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ marginTop: '0.15rem' }}>
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                ) : isCurrent ? (
                  <span className="pulsing-dot dot-warning" />
                ) : (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#475569', margin: '4px' }} />
                )}
              </div>
              <div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#ffffff' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
