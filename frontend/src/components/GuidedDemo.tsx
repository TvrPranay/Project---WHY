import React, { useState } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  BrainCircuit, 
  Check, 
  Info, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  DecisionExplanation, 
  DecisionAssessment, 
  RememberDecisionResponse, 
  EvidenceItem 
} from '../types/decision';
import { 
  reconstructDecision, 
  assessDecision, 
  rememberDecision 
} from '../services/api';

interface GuidedDemoProps {
  onExit: () => void;
  isHindsightConnected?: boolean;
}

export const GuidedDemo: React.FC<GuidedDemoProps> = ({ 
  onExit, 
  isHindsightConnected = true 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real data state populated strictly from backend responses
  const [question] = useState<string>('Why did FinFlow choose Provider X for European card payments?');
  const [withoutMemoryResult, setWithoutMemoryResult] = useState<DecisionExplanation | null>(null);
  const [withHindsightResult, setWithHindsightResult] = useState<DecisionExplanation | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<DecisionAssessment | null>(null);
  const [rememberResult, setRememberResult] = useState<RememberDecisionResponse | null>(null);
  const [isRemembering, setIsRemembering] = useState<boolean>(false);

  // Collapsible UI panels
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // STEP 1 -> STEP 2: Run WITHOUT Memory
  const handleStartInvestigation = async () => {
    setIsLoading(true);
    setLoadingMessage('Reconstructing decision without organizational memory...');
    setErrorMessage(null);

    try {
      const result = await reconstructDecision(question, null, 15, 'none');
      setWithoutMemoryResult(result);
      setCurrentStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query decision without memory.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 -> STEP 3: Run WITH Hindsight Memory
  const handleRunWithHindsight = async () => {
    setIsLoading(true);
    setLoadingMessage('Recalling organizational memory from Hindsight Cloud...');
    setErrorMessage(null);

    try {
      const result = await reconstructDecision(question, null, 15, 'hindsight');
      setWithHindsightResult(result);
      setCurrentStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to recall from Hindsight Cloud.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3 -> STEP 4: Check if reasons still hold (Temporal Invalidation)
  const handleCheckWhatChanged = async () => {
    setIsLoading(true);
    setLoadingMessage('Comparing original assumptions against subsequent organizational evidence...');
    setErrorMessage(null);

    try {
      const result = await assessDecision(question);
      setAssessmentResult(result);
      setCurrentStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assess decision invalidation.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 4 -> STEP 5: Advance to Remember Step
  const handleProceedToRemember = () => {
    setCurrentStep(5);
  };

  // STEP 5: Retain Investigation into Hindsight
  const handleRememberInvestigation = async () => {
    if (!withHindsightResult || !assessmentResult) return;
    setIsRemembering(true);
    setErrorMessage(null);

    try {
      const payload = {
        question,
        decision: withHindsightResult.decision,
        status: assessmentResult.status || 'REVIEW REQUIRED',
        reasons: withHindsightResult.reasons,
        changed_assumptions: assessmentResult.changed_assumptions || [],
        alternatives: withHindsightResult.alternatives?.map((a) => a.name) || [],
        evidence_ids: assessmentResult.source_documents || withHindsightResult.source_documents || [],
        impact_summary: assessmentResult.impact_summary || withHindsightResult.summary,
        confidence: assessmentResult.confidence || withHindsightResult.confidence,
        decision_id: withHindsightResult.decision_id || 'finflow-provider-x-europe',
      };
      const result = await rememberDecision(payload);
      setRememberResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retain investigation in Hindsight.';
      setErrorMessage(msg);
    } finally {
      setIsRemembering(false);
    }
  };

  // Reset demo state (does NOT delete Hindsight memories)
  const handleRestartDemo = () => {
    setCurrentStep(1);
    setWithoutMemoryResult(null);
    setWithHindsightResult(null);
    setAssessmentResult(null);
    setRememberResult(null);
    setErrorMessage(null);
  };

  const steps = [
    { number: '01', title: 'Ask' },
    { number: '02', title: 'Without Memory' },
    { number: '03', title: 'With Hindsight' },
    { number: '04', title: 'What Changed' },
    { number: '05', title: 'Remember' },
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '1080px' }}>
      {/* Top Demo Bar / Progress Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Left: Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            border: '1px solid rgba(59, 130, 246, 0.4)',
          }}>
            <Sparkles size={13} />
            Guided Demo
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            60–90 Second Judge Walkthrough
          </span>
        </div>

        {/* Center: Stepper */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap',
        }}>
          {steps.map((s, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  // Allow jumping to already completed steps
                  if (stepNum < currentStep) {
                    setCurrentStep(stepNum);
                  }
                }}
                disabled={stepNum > currentStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: isActive 
                    ? 'rgba(59, 130, 246, 0.25)' 
                    : isCompleted 
                    ? 'rgba(16, 185, 129, 0.12)' 
                    : 'transparent',
                  border: isActive 
                    ? '1px solid rgba(59, 130, 246, 0.6)' 
                    : isCompleted 
                    ? '1px solid rgba(16, 185, 129, 0.3)' 
                    : '1px solid transparent',
                  color: isActive 
                    ? '#ffffff' 
                    : isCompleted 
                    ? '#34d399' 
                    : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: isCompleted ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{s.number}</span>
                <span>{s.title}</span>
                {isCompleted && <Check size={12} style={{ color: '#34d399' }} />}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            title="Toggle technical details"
          >
            <Database size={13} />
            <span>Technical details</span>
            {showTechnicalDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          <button
            type="button"
            onClick={handleRestartDemo}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            title="Restart demo from step 1"
          >
            <RotateCcw size={12} />
            <span>Restart Demo</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            title="Exit to standard investigation mode"
          >
            <X size={12} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Expandable Technical Details Drawer */}
      {showTechnicalDetails && (
        <div className="panel" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#60a5fa' }}>
              System Configuration & Metadata
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Real runtime values</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            fontSize: '0.82rem',
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>HINDSIGHT STATUS:</span>
              <span style={{ fontWeight: 600, color: isHindsightConnected ? '#34d399' : '#f87171' }}>
                {isHindsightConnected ? 'Connected (Cloud)' : 'Offline'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>MEMORY BANK:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>finflow-why</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>PRIMARY EVIDENCE:</span>
              <span style={{ fontWeight: 600, color: '#ffffff' }}>
                {withHindsightResult?.evidence?.length ?? 'Pending'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>PRIOR INVESTIGATIONS:</span>
              <span style={{ fontWeight: 600, color: '#ffffff' }}>
                {withHindsightResult?.prior_investigations_count ?? 'Pending'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ACTIVE MEMORY MODE:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>
                {currentStep === 2 ? 'none' : 'hindsight'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          color: '#f87171',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                <AlertTriangle size={18} />
                <span>Demo step could not be completed.</span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                {errorMessage}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1) handleStartInvestigation();
                  else if (currentStep === 2) handleRunWithHindsight();
                  else if (currentStep === 3) handleCheckWhatChanged();
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                Retry
              </button>
              <button
                type="button"
                onClick={onExit}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                Return to normal investigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay State */}
      {isLoading && (
        <div className="panel" style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
        }}>
          <div style={{
            display: 'inline-block',
            width: '42px',
            height: '42px',
            border: '3px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1.25rem',
          }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.45rem' }}>
            {loadingMessage}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
            Communicating with backend services and live Hindsight Cloud memory bank.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: ASK */}
      {/* ========================================================================= */}
      {!isLoading && currentStep === 1 && (
        <div>
          {/* Product Intro */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93c5fd',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              <BrainCircuit size={14} style={{ color: '#60a5fa' }} />
              WHY — Organizational Decision Memory
            </div>

            <h1 style={{
              fontSize: '2.35rem',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '0.85rem',
              background: 'linear-gradient(180deg, #ffffff 40%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Start with a question.
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 1.5rem auto',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}>
              &ldquo;Every company remembers what happened. WHY remembers why it happened &mdash; and tells you when that reasoning changes.&rdquo;
            </p>
          </div>

          {/* Interactive Question Card */}
          <div className="panel" style={{
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
            padding: '2rem 2.25rem',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Decision Under Investigation
            </div>

            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1rem',
              lineHeight: 1.4,
            }}>
              &ldquo;{question}&rdquo;
            </h2>

            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}>
              Organizational decisions often outlive the reasons that created them. Let&apos;s investigate this decision to discover why it was made and whether those original reasons still hold.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleStartInvestigation}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.92rem' }}
              >
                <span>Investigate</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: WITHOUT MEMORY */}
      {/* ========================================================================= */}
      {!isLoading && currentStep === 2 && withoutMemoryResult && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              marginBottom: '0.65rem',
              color: '#ffffff',
            }}>
              What happens without organizational memory?
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              Running the investigation with memory disabled (<code style={{ color: '#93c5fd' }}>memory_mode=&quot;none&quot;</code>) directly demonstrates the limitation of isolated LLMs.
            </p>
          </div>

          <div className="panel" style={{
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
            padding: '2rem',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
          }}>
            {/* Header Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <span className="badge badge-subtle" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}>
                WITHOUT HINDSIGHT
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Bypassed Recall Mode
              </span>
            </div>

            {/* Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}>
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(10, 15, 29, 0.6)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Evidence Recalled
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#94a3b8' }}>
                  {withoutMemoryResult.evidence?.length ?? 0}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(10, 15, 29, 0.6)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Prior Investigations
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#94a3b8' }}>
                  {withoutMemoryResult.prior_investigations_count ?? 0}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(10, 15, 29, 0.6)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Status
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.45rem' }}>
                  {withoutMemoryResult.status}
                </div>
              </div>
            </div>

            {/* Message Callout */}
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '2rem',
            }}>
              <p style={{ fontSize: '0.92rem', color: '#fde68a', lineHeight: 1.6 }}>
                <strong>Honest Refusal:</strong> &ldquo;{withoutMemoryResult.summary || 'Without organizational memory, WHY cannot reconstruct the historical decision without inventing facts.'}&rdquo;
              </p>
            </div>

            {/* CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                Now give WHY its memory.
              </span>
              <button
                type="button"
                onClick={handleRunWithHindsight}
                className="btn btn-primary"
                style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}
              >
                <span>Continue with Hindsight</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: WITH HINDSIGHT */}
      {/* ========================================================================= */}
      {!isLoading && currentStep === 3 && withHindsightResult && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              marginBottom: '0.65rem',
              color: '#ffffff',
            }}>
              Decision Reconstructed with Hindsight
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              Persistent recall connects historical Slack discussions, Jira tickets, and ADRs across time.
            </p>
          </div>

          <div className="panel" style={{
            maxWidth: '840px',
            margin: '0 auto 2.5rem auto',
            padding: '2rem',
            border: '1px solid rgba(59, 130, 246, 0.45)',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
          }}>
            {/* Header Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <span className="badge badge-active" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}>
                WITH HINDSIGHT
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Bank: <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>finflow-why</strong>
              </span>
            </div>

            {/* Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}>
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(10, 15, 29, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Primary Evidence Recalled
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>
                  {withHindsightResult.evidence?.length ?? 0} records
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(10, 15, 29, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Prior Investigations
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc' }}>
                  {withHindsightResult.prior_investigations_count ?? 0} memories
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(10, 15, 29, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Reconstruction Status
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', marginTop: '0.45rem' }}>
                  {withHindsightResult.status}
                </div>
              </div>
            </div>

            {/* Decision Statement */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              marginBottom: '1.75rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Reconstructed Decision
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                {withHindsightResult.decision}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {withHindsightResult.summary}
              </p>
            </div>

            {/* Why It Was Chosen */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
                WHY IT WAS CHOSEN
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {withHindsightResult.reasons && withHindsightResult.reasons.length > 0 ? (
                  withHindsightResult.reasons.map((r, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(10, 15, 29, 0.6)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                          Reason {idx + 1}: {r.reason}
                        </div>
                      </div>

                      {/* Evidence citations */}
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        {r.evidence_ids && r.evidence_ids.map((id) => (
                          <span key={id} className="badge badge-evidence">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    No specific reasons returned by reconstruction service.
                  </div>
                )}
              </div>
            </div>

            {/* Explanatory Callout (Product truth, no fake claims) */}
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <Info size={18} style={{ color: '#60a5fa', flexShrink: 0 }} />
              <p style={{ fontSize: '0.86rem', color: '#93c5fd', lineHeight: 1.5, margin: 0 }}>
                Hindsight gives WHY persistent organizational context that cannot be recovered from the current conversation alone.
              </p>
            </div>

            {/* Next Action */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Original reasoning reconstructed. Are those assumptions still true?
              </span>
              <button
                type="button"
                onClick={handleCheckWhatChanged}
                className="btn btn-assess"
                style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem', fontWeight: 700 }}
              >
                <span>Check if those reasons still hold</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: WHAT CHANGED (THE IMPORTANT MOMENT) */}
      {/* ========================================================================= */}
      {!isLoading && currentStep === 4 && assessmentResult && withHindsightResult && (
        <div>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '1rem',
            }}>
              <AlertTriangle size={14} />
              Temporal Reasoning Engine
            </div>

            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '0.75rem',
              color: '#ffffff',
            }}>
              The decision stayed. The assumptions changed.
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
              WHY compares historical decision rationales against subsequent organizational events across time.
            </p>
          </div>

          {/* Temporal Transition Banner */}
          <div className="panel" style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-default)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              textAlign: 'center',
            }}>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                  2024
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                  Decision made
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Provider X selected
                </div>
              </div>

              <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>

              <div style={{ flex: 1, minWidth: '130px' }}>
                <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
                  2025
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                  Operational friction
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  SLA breaches &amp; latency
                </div>
              </div>

              <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>

              <div style={{ flex: 1, minWidth: '130px' }}>
                <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
                  2026
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                  New evidence
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Alternative certified, REST v2
                </div>
              </div>

              <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>

              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
                  Result
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fbbf24' }}>
                  {assessmentResult.status.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Invalidated assumptions
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Status Moment */}
          <div style={{
            padding: '1.75rem 2rem',
            borderRadius: '12px',
            backgroundColor: assessmentResult.status === 'REVIEW REQUIRED' 
              ? 'rgba(245, 158, 11, 0.14)' 
              : 'rgba(59, 130, 246, 0.14)',
            border: `1px solid ${assessmentResult.status === 'REVIEW REQUIRED' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(59, 130, 246, 0.45)'}`,
            marginBottom: '2.5rem',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: assessmentResult.status === 'REVIEW REQUIRED' ? '#fbbf24' : '#60a5fa',
              marginBottom: '0.5rem',
            }}>
              <AlertTriangle size={26} />
              <span>{assessmentResult.status.replace('_', ' ')}</span>
            </div>
            <p style={{
              fontSize: '1rem',
              color: '#ffffff',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              {assessmentResult.status === 'REVIEW REQUIRED' 
                ? 'Historical reasoning that once justified this decision has materially changed.' 
                : assessmentResult.impact_summary}
            </p>
          </div>

          {/* Reason Comparisons (Rendered strictly from backend response) */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
              Changed Assumptions Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {assessmentResult.affected_reasons && assessmentResult.affected_reasons.length > 0 ? (
                assessmentResult.affected_reasons.map((item, idx) => (
                  <div
                    key={idx}
                    className="panel"
                    style={{
                      padding: '1.5rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div className="grid-two" style={{ gap: '1.5rem', marginBottom: '1rem' }}>
                      {/* Left: Original Reason */}
                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(10, 15, 29, 0.6)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          ORIGINAL ASSUMPTION
                        </div>
                        <p style={{ fontSize: '0.88rem', color: '#ffffff', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                          {item.original_reason}
                        </p>
                        {item.original_evidence_ids && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {item.original_evidence_ids.map((id) => (
                              <span key={id} className="badge badge-evidence">
                                {id}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: New Assessment / Evidence */}
                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(10, 15, 29, 0.6)',
                        borderRadius: '8px',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          NEW EVIDENCE
                        </div>
                        <p style={{ fontSize: '0.88rem', color: '#ffffff', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                          {item.assessment}
                        </p>
                        {item.new_evidence_ids && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {item.new_evidence_ids.map((id) => (
                              <span key={id} className="badge badge-evidence" style={{ borderColor: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24' }}>
                                {id}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assessment Status Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ASSESSMENT:</span>
                        <span className={`badge ${item.current_support === 'INVALIDATED' ? 'badge-invalidated' : 'badge-review'}`}>
                          {item.current_support}
                        </span>
                        {item.impact && (
                          <span className="badge badge-subtle" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                            {item.impact} IMPACT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="panel" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
                  No assumptions flagged as changed for this decision.
                </div>
              )}
            </div>
          </div>

          {/* Evidence Trail ("Why does WHY believe this?") */}
          <div className="panel" style={{
            padding: '1.75rem',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            marginBottom: '2.5rem',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.45rem' }}>
              Why does WHY believe this?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Authoritative organizational records superseding prior AI reasoning.
            </p>

            <div className="grid-two" style={{ gap: '1.5rem' }}>
              {/* Primary Evidence */}
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#60a5fa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '0.75rem',
                }}>
                  AUTHORITATIVE ORGANIZATIONAL EVIDENCE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {withHindsightResult.evidence && withHindsightResult.evidence.slice(0, 4).map((item: EvidenceItem, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(10, 15, 29, 0.6)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ color: '#ffffff' }}>{item.title}</strong>
                        <span className="badge badge-evidence">{item.source_type}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prior AI Reasoning */}
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#c084fc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '0.75rem',
                }}>
                  PRIOR AI REASONING (CONTEXT ONLY)
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(88, 28, 135, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  fontSize: '0.82rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <BrainCircuit size={15} />
                    <span>Prior Investigation Memories</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    WHY recalls previous investigation summaries as institutional context. Primary organizational evidence always supersedes prior AI reasoning.
                  </p>
                  <span className="badge badge-subtle" style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)' }}>
                    Epistemic Hierarchy Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleProceedToRemember}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.6rem', fontSize: '0.92rem' }}
            >
              <span>Continue to Step 5: Remember</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: REMEMBER & FINAL LOOP */}
      {/* ========================================================================= */}
      {!isLoading && currentStep === 5 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '1rem',
            }}>
              <CheckCircle2 size={14} />
              Compounding Memory Loop
            </div>

            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '0.75rem',
              color: '#ffffff',
            }}>
              Now WHY remembers.
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              Close the organizational learning loop by persisting this investigation back into Hindsight.
            </p>
          </div>

          {/* Retention Action Card */}
          <div className="panel" style={{
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
            padding: '2rem 2.25rem',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
          }}>
            {!rememberResult ? (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Retain Investigation Reasoning
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                  Store this full investigation &mdash; the original decision, reconstructed reasons, invalidated assumptions, and review status &mdash; into Hindsight Cloud bank <strong style={{ color: '#ffffff' }}>finflow-why</strong>.
                </p>

                <button
                  type="button"
                  onClick={handleRememberInvestigation}
                  disabled={isRemembering}
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.6rem',
                    fontSize: '0.92rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: '#10b981',
                  }}
                >
                  {isRemembering ? (
                    <span>Retaining in Hindsight Cloud...</span>
                  ) : (
                    <>
                      <Database size={16} />
                      <span>Remember this investigation</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  color: '#34d399',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  marginBottom: '0.75rem',
                }}>
                  <CheckCircle2 size={24} />
                  <span>&check; REMEMBERED IN HINDSIGHT</span>
                </div>

                <p style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  Future investigations can recall this reasoning as prior AI context.
                </p>

                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(10, 15, 29, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>DOCUMENT ID:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{rememberResult.document_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>MEMORY TYPE:</span>
                    <span style={{ color: '#ffffff' }}>decision_investigation</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>CLASSIFICATION:</span>
                    <span className="badge badge-subtle" style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)' }}>
                      PRIOR AI REASONING (NON-AUTHORITATIVE)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Final Loop Visualization */}
          <div className="panel" style={{
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
            padding: '2rem',
            backgroundColor: 'rgba(10, 15, 29, 0.85)',
            border: '1px solid var(--border-default)',
            textAlign: 'center',
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              The Compounding Organizational Decision Loop
            </h4>

            <div style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#93c5fd',
              marginBottom: '1.5rem',
            }}>
              <span style={{ color: '#60a5fa' }}>ORGANIZATIONAL EVIDENCE</span>
              <span style={{ color: 'var(--text-muted)' }}>&darr;</span>
              <span style={{ color: '#34d399' }}>HINDSIGHT</span>
              <span style={{ color: 'var(--text-muted)' }}>&darr;</span>
              <span style={{ color: '#ffffff' }}>DECISION RECONSTRUCTION</span>
              <span style={{ color: 'var(--text-muted)' }}>&darr;</span>
              <span style={{ color: '#fbbf24' }}>TEMPORAL REASONING</span>
              <span style={{ color: 'var(--text-muted)' }}>&darr;</span>
              <span style={{ color: '#c084fc' }}>DECISION MEMORY</span>
              <span style={{ color: 'var(--text-muted)' }}>&darr;</span>
              <span style={{ color: '#34d399' }}>HINDSIGHT</span>
              <span style={{ color: '#60a5fa', fontSize: '1.1rem' }}>&circlearrowleft;</span>
            </div>

            <p style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.5,
              maxWidth: '520px',
              margin: '0 auto',
            }}>
              &ldquo;WHY doesn&apos;t just retrieve the past. It preserves the reasoning that explains it.&rdquo;
            </p>
          </div>

          {/* Bottom Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <button
              type="button"
              onClick={handleRestartDemo}
              className="btn btn-secondary"
              style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}
            >
              <RotateCcw size={15} />
              <span>Restart Demo</span>
            </button>

            <button
              type="button"
              onClick={onExit}
              className="btn btn-primary"
              style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}
            >
              <span>Return to normal investigation</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
