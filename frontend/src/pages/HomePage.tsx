import React, { useState } from 'react';
import { HealthState } from '../types/health';
import { DecisionExplanation, DecisionAssessment, EvidenceItem, MemoryComparisonResponse } from '../types/decision';
import { reconstructDecision, assessDecision, fetchMemoryComparison } from '../services/api';
import { InvestigationBar } from '../components/InvestigationBar';
import { DecisionOverview } from '../components/DecisionOverview';
import { DecisionTimeline } from '../components/DecisionTimeline';
import { AssessmentBanner } from '../components/AssessmentBanner';
import { ReasonComparison } from '../components/ReasonComparison';
import { EvidencePanel } from '../components/EvidencePanel';
import { DecisionMemorySection } from '../components/DecisionMemorySection';
import { MemoryComparison } from '../components/MemoryComparison';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { AlertCircle, BrainCircuit, RefreshCw, Layers, Sparkles } from 'lucide-react';

interface HomePageProps {
  health: HealthState & { refetch: () => void };
  onLaunchGuidedDemo?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ health, onLaunchGuidedDemo }) => {
  const [currentQuery, setCurrentQuery] = useState<string>('Why did FinFlow choose Provider X for European card payments?');
  const [explanation, setExplanation] = useState<DecisionExplanation | null>(null);
  const [assessment, setAssessment] = useState<DecisionAssessment | null>(null);
  const [isReconstructing, setIsReconstructing] = useState<boolean>(false);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Phase 8: Controlled Memory Comparison State
  const [comparisonData, setComparisonData] = useState<MemoryComparisonResponse | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  const handleInvestigate = async (queryToRun: string) => {
    setCurrentQuery(queryToRun);
    setIsReconstructing(true);
    setErrorMessage(null);
    setAssessment(null);
    setSelectedDocId(null);
    setShowComparison(false);

    try {
      const result = await reconstructDecision(queryToRun);
      setExplanation(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reconstruct decision memory';
      setErrorMessage(msg);
      setExplanation(null);
    } finally {
      setIsReconstructing(false);
    }
  };

  const handleTriggerComparison = async () => {
    setIsLoadingComparison(true);
    setErrorMessage(null);

    try {
      const result = await fetchMemoryComparison(currentQuery);
      setComparisonData(result);
      setShowComparison(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute memory comparison';
      setErrorMessage(msg);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const handleContinueTemporal = async (reconstructedExp: DecisionExplanation) => {
    setExplanation(reconstructedExp);
    setShowComparison(false);
    setIsAssessing(true);
    setErrorMessage(null);

    try {
      const queryParam = reconstructedExp.question || currentQuery;
      const result = await assessDecision(queryParam);
      setAssessment(result);

      // Smooth scroll to the assessment results banner
      setTimeout(() => {
        const el = document.getElementById('assessment-anchor');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assess decision invalidation';
      setErrorMessage(msg);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleAssess = async () => {
    if (!explanation && !currentQuery) return;
    setIsAssessing(true);
    setErrorMessage(null);

    try {
      const queryParam = explanation?.question || currentQuery;
      const result = await assessDecision(queryParam);
      setAssessment(result);

      // Smooth scroll to the assessment results banner
      setTimeout(() => {
        const el = document.getElementById('assessment-anchor');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assess decision invalidation';
      setErrorMessage(msg);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    setTimeout(() => {
      const el = document.getElementById('evidence-trail');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Combine and deduplicate evidence items from both reconstruct and assessment stages
  const combinedEvidence: EvidenceItem[] = React.useMemo(() => {
    const list: EvidenceItem[] = [];
    const seenTitles = new Set<string>();

    if (explanation?.evidence) {
      for (const item of explanation.evidence) {
        if (!seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          list.push(item);
        }
      }
    }

    if (assessment?.new_evidence) {
      for (const item of assessment.new_evidence) {
        if (!seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          list.push(item);
        }
      }
    }

    if (assessment?.evidence) {
      for (const item of assessment.evidence) {
        if (!seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          list.push(item);
        }
      }
    }

    return list;
  }, [explanation, assessment]);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Backend connection warning if health check fails */}
      {health.error && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '0.65rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: '#fbbf24',
        }}>
          <span>Backend at http://127.0.0.1:8001 is connecting or not yet responding.</span>
          <button
            onClick={() => health.refetch()}
            className="btn btn-secondary"
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Search / Investigation Bar */}
      <InvestigationBar
        initialQuestion={currentQuery}
        onInvestigate={handleInvestigate}
        isLoading={isReconstructing || isAssessing || isLoadingComparison}
      />

      {/* Action Buttons Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        marginTop: '-1.25rem',
        gap: '0.85rem',
        flexWrap: 'wrap',
      }}>
        {onLaunchGuidedDemo && (
          <button
            type="button"
            onClick={onLaunchGuidedDemo}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.6rem 1.35rem',
              fontSize: '0.86rem',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 2px 12px rgba(59, 130, 246, 0.45)',
            }}
          >
            <Sparkles size={16} />
            <span>Run Guided Demo (60s)</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleTriggerComparison}
          disabled={isReconstructing || isAssessing || isLoadingComparison}
          className="btn btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.6rem 1.4rem',
            fontSize: '0.86rem',
            fontWeight: 600,
            borderRadius: '10px',
            backgroundColor: showComparison ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.08)',
            borderColor: showComparison ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.35)',
            color: '#93c5fd',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
            cursor: isLoadingComparison ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Layers size={16} style={{ color: '#60a5fa' }} />
          <span>{isLoadingComparison ? 'Running Controlled Comparison...' : 'See WHY with and without memory'}</span>
        </button>
      </div>

      {/* Comparison Loading Indicator */}
      {isLoadingComparison && (
        <div className="panel" style={{
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}>
          <div style={{
            display: 'inline-block',
            width: '36px',
            height: '36px',
            border: '3px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem',
          }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
            Running Controlled Experiment...
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.5 }}>
            Executing parallel pipelines: reconstructing without memory (bypassing recall) vs reconstructing with Hindsight persistent memory bank.
          </p>
        </div>
      )}

      {/* Controlled Before/After Memory Comparison Side-by-Side View */}
      {showComparison && comparisonData && !isLoadingComparison && (
        <MemoryComparison
          comparison={comparisonData}
          onContinueTemporal={handleContinueTemporal}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Error notification alert */}
      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#f87171',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              {errorMessage}
            </span>
          </div>
          <button
            onClick={() => handleInvestigate(currentQuery)}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Dynamic Main Body Content */}
      {isReconstructing ? (
        <LoadingState type="reconstruct" />
      ) : explanation ? (
        <div>
          {/* Second Run Callout: Previous reasoning found in Hindsight */}
          {explanation.prior_investigations_count !== undefined && explanation.prior_investigations_count > 0 && (
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: '8px',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <BrainCircuit size={19} style={{ color: '#60a5fa' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                    Previous reasoning found:
                  </span>{' '}
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {explanation.prior_investigations_count} prior investigation {explanation.prior_investigations_count === 1 ? 'memory' : 'memories'} recalled from Hindsight.
                  </span>
                </div>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                Compounding Memory Active
              </span>
            </div>
          )}

          {/* Decision Timeline: 2024 -> 2025 -> 2026 */}
          <DecisionTimeline
            explanation={explanation}
            assessment={assessment}
            onSelectDoc={handleSelectDoc}
          />

          {/* If Invalidation Assessment is in progress */}
          {isAssessing && <LoadingState type="assess" />}

          {/* Invalidation Assessment Result Banner & Reason Comparison */}
          {assessment && !isAssessing && (
            <div id="assessment-anchor">
              <AssessmentBanner
                assessment={assessment}
                onReassess={handleAssess}
                isAssessing={isAssessing}
              />

              <ReasonComparison
                reasons={assessment.affected_reasons}
                onSelectDoc={handleSelectDoc}
              />
            </div>
          )}

          {/* Reconstructed Decision Overview & CTA */}
          <DecisionOverview
            explanation={explanation}
            onAssess={handleAssess}
            isAssessing={isAssessing}
            hasAssessment={Boolean(assessment)}
            onSelectDoc={handleSelectDoc}
          />

          {/* Decision Memory & Learning Loop Section (Phase 7) */}
          <DecisionMemorySection
            explanation={explanation}
            assessment={assessment}
            primaryEvidenceCount={explanation.evidence?.length || 0}
          />

          {/* Interactive Evidence Trail */}
          <EvidencePanel
            evidence={combinedEvidence}
            selectedDocId={selectedDocId}
          />
        </div>
      ) : (
        <EmptyState onSelectSample={handleInvestigate} />
      )}
    </div>
  );
};
