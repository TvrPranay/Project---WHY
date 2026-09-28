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
      borderBottom: '1px solid var(--border-default)',
      backgroundColor: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.05rem',
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}>
            ?
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                WHY
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}>
                Decision Memory
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Remember why. Know when it changes.
            </div>
          </div>
        </div>

        {/* Right context: Organization & Hindsight status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-default)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}>
            <Database size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>FinFlow</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>org</span>
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
                gap: '0.35rem',
              }}
            >
              <Compass size={13} />
              <span>Normal Mode</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleMode && onToggleMode('demo')}
              className="btn btn-primary"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.8rem',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={13} />
              <span>Run Guided Demo</span>
            </button>
          )}

          {/* Hindsight connection status pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: isHindsightConnected ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${isHindsightConnected ? '#a7f3d0' : '#fecaca'}`,
            fontSize: '0.78rem',
          }}>
            <span className={`pulsing-dot ${isHindsightConnected ? 'dot-success' : 'dot-error'}`} />
            <span style={{
              fontWeight: 600,
              color: isHindsightConnected ? '#065f46' : '#991b1b',
            }}>
              {isHindsightConnected ? 'Hindsight Connected' : 'Hindsight Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
