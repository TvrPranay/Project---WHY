/**
 * Type definition for backend health response.
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface HealthState {
  data: HealthResponse | null;
  loading: boolean;
  error: string | null;
  latencyMs: number | null;
  lastChecked: Date | null;
}
