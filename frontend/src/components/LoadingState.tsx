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
      padding: '2.5rem 1.75rem',
      maxWidth: '640px',
      margin: '0 auto 2.5rem auto',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-default)',
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        marginBottom: '1rem',
      }}>
        {type === 'reconstruct' ? (
          <Database size={22} style={{ color: 'var(--accent-blue)' }} />
        ) : (
          <BrainCircuit size={22} style={{ color: '#d97706' }} />
        )}
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
        {type === 'reconstruct' ? 'Reconstructing Decision Memory' : 'Evaluating Temporal Invalidation'}
      </h3>
      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
        {type === 'reconstruct'
          ? 'Interrogating Hindsight persistent bank for historical reasoning and constraints...'
          : 'Analyzing organizational shifts across time to identify invalidated assumptions...'}
      </p>

      {/* Progress Step List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        textAlign: 'left',
        maxWidth: '440px',
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
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                backgroundColor: isCurrent ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${isCurrent ? '#bfdbfe' : 'var(--border-default)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ marginTop: '0.15rem' }}>
                {isDone ? (
                  <CheckCircle2 size={15} style={{ color: '#059669' }} />
                ) : isCurrent ? (
                  <span className="pulsing-dot dot-warning" />
                ) : (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1', margin: '3px' }} />
                )}
              </div>
              <div>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: isCurrent ? 700 : 600,
                  color: isCurrent ? 'var(--accent-blue)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
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
