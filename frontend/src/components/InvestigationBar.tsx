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
        fontSize: '2.35rem',
        fontWeight: 800,
        letterSpacing: '-0.035em',
        lineHeight: 1.2,
        marginBottom: '0.75rem',
        background: 'linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Why does this decision still exist?
      </h1>
      <p style={{
        fontSize: '1.05rem',
        color: 'var(--text-secondary)',
        maxWidth: '680px',
        margin: '0 auto 1.75rem auto',
        lineHeight: 1.6,
      }}>
        WHY reconstructs the reasoning behind organizational decisions and detects when the assumptions behind them change.
      </p>

      {/* Prominent Investigation Form */}
      <form onSubmit={handleSubmit} style={{
        maxWidth: '820px',
        margin: '0 auto',
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '0.4rem 0.5rem 0.4rem 1.1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease',
        }}>
          <Search size={18} style={{ color: '#64748b', marginRight: '0.75rem', flexShrink: 0 }} />
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
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="btn btn-primary"
            style={{ padding: '0.7rem 1.4rem' }}
          >
            {isLoading ? (
              <span>Investigating...</span>
            ) : (
              <>
                <span>Investigate</span>
                <ArrowRight size={15} />
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
        marginTop: '1rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Sparkles size={12} style={{ color: '#60a5fa' }} /> Try:
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
