import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

interface InvestigationBarProps {
  initialQuestion?: string;
  onInvestigate: (question: string) => void;
  isLoading: boolean;
}

export const InvestigationBar: React.FC<InvestigationBarProps> = ({
  initialQuestion = 'Why did FinFlow choose Provider X for European card payments?',
  onInvestigate,
  isLoading,
}) => {
  const [question, setQuestion] = useState(initialQuestion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onInvestigate(question.trim());
    }
  };

  const handleChipClick = (chipQuestion: string) => {
    setQuestion(chipQuestion);
    onInvestigate(chipQuestion);
  };

  const suggestedChips = [
    'Why did FinFlow choose Provider X for European card payments?',
    'What assumptions supported this decision?',
    'Why did FinFlow choose AWS Lambda in 2023?',
  ];

  return (
    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
      {/* Hero Typography */}
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.025em',
        lineHeight: 1.25,
        marginBottom: '0.5rem',
        color: 'var(--text-primary)',
      }}>
        Why does this decision still exist?
      </h1>
      <p style={{
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        maxWidth: '620px',
        margin: '0 auto 1.5rem auto',
        lineHeight: 1.55,
      }}>
        WHY reconstructs the reasoning behind organizational decisions and detects when foundational assumptions change.
      </p>

      {/* Professional Investigation Form */}
      <form onSubmit={handleSubmit} style={{
        maxWidth: '780px',
        margin: '0 auto',
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-strong)',
          borderRadius: '8px',
          padding: '0.35rem 0.45rem 0.35rem 1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}>
          <Search size={17} style={{ color: 'var(--text-muted)', marginRight: '0.65rem', flexShrink: 0 }} />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask why any architectural, product, or organizational decision was made..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.15rem' }}
          >
            {isLoading ? (
              <span>Investigating...</span>
            ) : (
              <>
                <span>Investigate</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested question chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.85rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Sparkles size={11} style={{ color: 'var(--accent-blue)' }} /> Suggestions:
        </span>
        {suggestedChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className="chip"
            onClick={() => handleChipClick(chip)}
            disabled={isLoading}
            style={{ borderStyle: chip.includes('Lambda') ? 'dashed' : 'solid' }}
          >
            {chip.includes('Lambda') ? `${chip} (Insufficient)` : chip}
          </button>
        ))}
      </div>
    </div>
  );
};
