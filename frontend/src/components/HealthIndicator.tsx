import React from 'react';
import { HealthState } from '../types/health';

interface HealthIndicatorProps {
  health: HealthState & { refetch: () => void };
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ health }) => {
  const isConnected = health.data?.status === 'ok';

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className={`pulsing-dot ${isConnected ? 'dot-success' : 'dot-error'}`} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Backend Connection Status</h2>
          <span className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`}>
            {isConnected ? 'ONLINE (200 OK)' : health.loading ? 'CONNECTING...' : 'DISCONNECTED'}
          </span>
        </div>

        <button
          onClick={health.refetch}
          disabled={health.loading}
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '0.4rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: health.loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {health.loading ? 'Checking...' : 'Refresh Status'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
      }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            ENDPOINT
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
            GET /api/health
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            APP & VERSION
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            {health.data ? `${health.data.app_name} v${health.data.version}` : '—'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            ENVIRONMENT
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            {health.data ? health.data.environment : '—'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            LATENCY
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: health.latencyMs !== null && health.latencyMs < 100 ? 'var(--status-success)' : 'var(--text-primary)',
          }}>
            {health.latencyMs !== null ? `${health.latencyMs} ms` : '—'}
          </div>
        </div>
      </div>

      {health.error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          backgroundColor: 'var(--status-error-bg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--status-error)',
          fontSize: '0.85rem',
        }}>
          <strong>Connection Error:</strong> {health.error}
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Ensure FastAPI is running on <code>http://127.0.0.1:8000</code>. Run <code>python -m uvicorn app.main:app --port 8000</code> in <code>/backend</code>.
          </div>
        </div>
      )}
    </div>
  );
};
