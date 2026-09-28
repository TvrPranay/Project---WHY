import { useState, useEffect, useCallback } from 'react';
import { HealthState } from '../types/health';
import { fetchHealth } from '../services/api';

export function useHealth(pollIntervalMs: number = 10000) {
  const [state, setState] = useState<HealthState>({
    data: null,
    loading: true,
    error: null,
    latencyMs: null,
    lastChecked: null,
  });

  const checkHealth = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const { data, latencyMs } = await fetchHealth();
      setState({
        data,
        loading: false,
        error: null,
        latencyMs,
        lastChecked: new Date(),
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown connection error',
        lastChecked: new Date(),
      }));
    }
  }, []);

  useEffect(() => {
    checkHealth();
    if (pollIntervalMs > 0) {
      const timer = setInterval(checkHealth, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [checkHealth, pollIntervalMs]);

  return { ...state, refetch: checkHealth };
}
