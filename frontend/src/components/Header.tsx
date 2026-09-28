import React from 'react';
import { Database, Sparkles, Compass } from 'lucide-react';

interface HeaderProps {
  isHindsightConnected?: boolean;
  viewMode?: 'normal' | 'demo';
  onToggleMode?: (mode: 'normal' | 'demo') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isHindsightConnected = true,
  viewMode = 'normal',
  onToggleMode,
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.15rem',
            color: '#ffffff',
            boxShadow: '0 2px 10px rgba(59, 130, 246, 0.35)',
            letterSpacing: '-0.02em',
          }}>
            ?
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                WHY
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Decision Memory
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Remember why. Know when it changes.
            </div>
          </div>
        </div>

        {/* Right context: Organization & Hindsight status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid var(--border-default)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}>
            <Database size={13} style={{ color: '#94a3b8' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>FinFlow</span>
            <span style={{ color: 'var(--text-muted)' }}>org</span>
          </div>

          {/* Mode Switcher */}
          {viewMode === 'demo' ? (
            <button
              type="button"
              onClick={() => onToggleMode && onToggleMode('normal')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                gap: '0.4rem',
                borderRadius: '6px',
              }}
            >
              <Compass size={14} />
              <span>Normal Mode</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleMode && onToggleMode('demo')}
              className="btn btn-primary"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.85rem',
                gap: '0.4rem',
                borderRadius: '6px',
                boxShadow: '0 2px 10px rgba(59, 130, 246, 0.4)',
              }}
            >
              <Sparkles size={14} />
              <span>Run Guided Demo</span>
            </button>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: isHindsightConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isHindsightConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            fontSize: '0.8rem',
          }}>
            <span className={`pulsing-dot ${isHindsightConnected ? 'dot-success' : 'dot-error'}`} />
            <span style={{
              fontWeight: 600,
              color: isHindsightConnected ? '#34d399' : '#f87171',
            }}>
              {isHindsightConnected ? 'Hindsight Connected' : 'Hindsight Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
