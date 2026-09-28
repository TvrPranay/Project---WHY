import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { GuidedDemo } from './components/GuidedDemo';
import { useHealth } from './hooks/useHealth';

export const App: React.FC = () => {
  const health = useHealth(5000); // Poll health every 5 seconds
  const [viewMode, setViewMode] = useState<'normal' | 'demo'>('normal');

  const isHindsightConnected = health.data?.status === 'ok';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        isHindsightConnected={isHindsightConnected}
        viewMode={viewMode}
        onToggleMode={(mode) => setViewMode(mode)}
      />
      <main style={{ flex: 1 }}>
        {viewMode === 'demo' ? (
          <GuidedDemo
            onExit={() => setViewMode('normal')}
            isHindsightConnected={isHindsightConnected}
          />
        ) : (
          <HomePage
            health={health}
            onLaunchGuidedDemo={() => setViewMode('demo')}
          />
        )}
      </main>
      <footer style={{
        borderTop: '1px solid var(--border-default)',
        padding: '1.5rem 0',
        marginTop: '3rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        backgroundColor: '#ffffff',
      }}>
        <div className="container">
          WHY: Organizational Decision Memory Layer &bull; Powered by Hindsight Persistent Memory &bull; Production Ready
        </div>
      </footer>
    </div>
  );
};

export default App;
