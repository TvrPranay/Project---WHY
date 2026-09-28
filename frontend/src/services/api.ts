import { HealthResponse } from '../types/health';
import {
  DecisionAssessment,
  DecisionExplanation,
  DecisionHistoryResponse,
  MemoryComparisonResponse,
  RememberDecisionRequest,
  RememberDecisionResponse
} from '../types/decision';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8001';

const BASE_URLS = [
  BACKEND_BASE_URL,
  'http://127.0.0.1:8001',
  'http://127.0.0.1:8000',
  '',
];

/**
 * Helper to execute POST requests across candidate base URLs with fallback.
 */
async function postWithFallback<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let lastError: Error | null = null;

  for (const base of BASE_URLS) {
    const url = `${base}${path}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMsg = `Server returned ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson && errJson.detail) {
            errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
          }
        } catch {
          // Keep default status message
        }
        throw new Error(errorMsg);
      }

      return (await response.json()) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Continue to next candidate URL
    }
  }

  throw lastError || new Error(`Failed to POST to ${path}`);
}

/**
 * Fetch health status from backend API.
 */
export async function fetchHealth(): Promise<{ data: HealthResponse; latencyMs: number }> {
  const startTime = performance.now();
  const endpoints = [
    `${BACKEND_BASE_URL}/api/health`,
    'http://127.0.0.1:8001/api/health',
    'http://127.0.0.1:8000/api/health',
    '/api/health',
  ];

  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Health check returned status ${response.status} ${response.statusText}`);
      }

      const data: HealthResponse = await response.json();
      const latencyMs = Math.round(performance.now() - startTime);

      return { data, latencyMs };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('Failed to connect to backend health endpoint.');
}

/**
 * Reconstruct why an organizational decision was made from Hindsight persistent memory.
 */
export async function reconstructDecision(
  question: string,
  bankId?: string | null,
  limit: number = 15,
  memoryMode: 'none' | 'hindsight' = 'hindsight',
): Promise<DecisionExplanation> {
  return postWithFallback<DecisionExplanation>('/api/v1/decisions/reconstruct', {
    question,
    bank_id: bankId || null,
    limit,
    memory_mode: memoryMode,
  });
}

/**
 * Assess whether original decision rationale remains valid given later evidence.
 */
export async function assessDecision(
  question: string,
  bankId?: string | null,
  limit: number = 15,
): Promise<DecisionAssessment> {
  return postWithFallback<DecisionAssessment>('/api/v1/decisions/assess', {
    question,
    bank_id: bankId || null,
    limit,
  });
}

/**
 * Retain completed decision investigation into Hindsight persistent memory.
 */
export async function rememberDecision(
  payload: RememberDecisionRequest,
): Promise<RememberDecisionResponse> {
  return postWithFallback<RememberDecisionResponse>('/api/v1/decisions/remember', payload as unknown as Record<string, unknown>);
}

/**
 * Recall previous WHY investigation memories from Hindsight.
 */
export async function fetchDecisionHistory(
  question: string,
  bankId?: string | null,
  limit: number = 5,
): Promise<DecisionHistoryResponse> {
  return postWithFallback<DecisionHistoryResponse>('/api/v1/decisions/history', {
    question,
    bank_id: bankId || null,
    limit,
  });
}

/**
 * Execute controlled memory comparison (without memory vs with Hindsight).
 */
export async function fetchMemoryComparison(
  question: string,
  bankId?: string | null,
  limit: number = 15,
): Promise<MemoryComparisonResponse> {
  return postWithFallback<MemoryComparisonResponse>('/api/v1/demo/memory-comparison', {
    question,
    bank_id: bankId || null,
    limit,
  });
}


