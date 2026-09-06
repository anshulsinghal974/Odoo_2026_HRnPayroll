/**
 * services/ml-client.service.ts
 *
 * Thin HTTP client for the ML microservice defined in shared/api-contracts/ml-endpoints.md.
 *
 * Design principles:
 *  - NEVER throws to the caller. Every method returns a typed result or a
 *    neutral/empty fallback value so the core app remains fully operational
 *    when the ML service is unreachable.
 *  - Timeout is configurable via ML_SERVICE_TIMEOUT_MS (default 5 000 ms).
 *  - Base URL is configurable via ML_SERVICE_URL (default http://localhost:8000).
 *  - Logs a warning on fallback so ops can detect ML outages without app crashes.
 *
 * When Person 3 fills in shared/api-contracts/ml-endpoints.md, add the new
 * endpoint methods below following the same pattern as the stubs here.
 */

import http from 'http';
import https from 'https';

// ──────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────

const ML_BASE_URL = (process.env.ML_SERVICE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const ML_TIMEOUT_MS = parseInt(process.env.ML_SERVICE_TIMEOUT_MS ?? '5000', 10);

// ──────────────────────────────────────────────
// RESPONSE SHAPES
// ──────────────────────────────────────────────

export interface MlPayrunReadinessResponse {
  readiness_score: number;
  readiness_label: string;
  warnings: any[];
}

export interface MlAttendanceHealthResponse {
  employee_scores: any[];
  department_scores: any[];
}

export interface MlLeavePredictionResponse {
  department_id: string;
  target_month: string;
  expected_leave_days: number;
}

export interface MlSalaryForecastResponse {
  department_id: string;
  projected_cost: number;
  confidence_interval: number[];
}

export interface MlAttritionRiskResponse {
  employee_id: string;
  risk_level: string;
  factors: string[];
}

export interface MlNlpQueryResponse {
  answer: string;
  raw_sql: string;
  confidence: number;
}

// ──────────────────────────────────────────────
// LOW-LEVEL HTTP HELPER
// ──────────────────────────────────────────────

/**
 * Performs a JSON POST to the ML service.
 * Returns parsed response body or null on any failure (network, timeout, non-2xx).
 */
async function mlPost<TReq, TRes>(
  path: string,
  body: TReq
): Promise<TRes | null> {
  return new Promise((resolve) => {
    const payload = JSON.stringify(body);
    const url = new URL(`${ML_BASE_URL}${path}`);
    const transport = url.protocol === 'https:' ? https : http;

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Accept: 'application/json',
      },
      timeout: ML_TIMEOUT_MS,
    };

    const req = transport.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          if ((res.statusCode ?? 500) >= 200 && (res.statusCode ?? 500) < 300) {
            resolve(JSON.parse(raw) as TRes);
          } else {
            console.warn(
              `[MlClient] Non-2xx from ML service (${path}): HTTP ${res.statusCode}`
            );
            resolve(null);
          }
        } catch {
          console.warn(`[MlClient] Failed to parse ML response (${path})`);
          resolve(null);
        }
      });
    });

    req.on('timeout', () => {
      console.warn(`[MlClient] Request timed out (${path}, ${ML_TIMEOUT_MS}ms)`);
      req.destroy();
      resolve(null);
    });

    req.on('error', (err) => {
      console.warn(`[MlClient] Connection error (${path}): ${err.message}`);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Performs a JSON GET from the ML service.
 * Returns parsed response body or null on any failure.
 */
async function mlGet<TRes>(path: string): Promise<TRes | null> {
  return new Promise((resolve) => {
    const url = new URL(`${ML_BASE_URL}${path}`);
    const transport = url.protocol === 'https:' ? https : http;

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: ML_TIMEOUT_MS,
    };

    const req = transport.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          if ((res.statusCode ?? 500) >= 200 && (res.statusCode ?? 500) < 300) {
            resolve(JSON.parse(raw) as TRes);
          } else {
            console.warn(
              `[MlClient] Non-2xx from ML service (${path}): HTTP ${res.statusCode}`
            );
            resolve(null);
          }
        } catch {
          console.warn(`[MlClient] Failed to parse ML GET response (${path})`);
          resolve(null);
        }
      });
    });

    req.on('timeout', () => {
      console.warn(`[MlClient] GET timed out (${path}, ${ML_TIMEOUT_MS}ms)`);
      req.destroy();
      resolve(null);
    });

    req.on('error', (err) => {
      console.warn(`[MlClient] GET connection error (${path}): ${err.message}`);
      resolve(null);
    });

    req.end();
  });
}

// ──────────────────────────────────────────────
// PUBLIC API — one function per ML endpoint
// All functions return a safe fallback if ML is unreachable.
// ──────────────────────────────────────────────

export async function getPayrunReadiness(payload: any): Promise<MlPayrunReadinessResponse> {
  const result = await mlPost<any, MlPayrunReadinessResponse>('/warnings/payrun', payload);
  return result || { readiness_score: 100, readiness_label: "Green", warnings: [] };
}

export async function detectAttendanceAnomalies(payload: any): Promise<any> {
  const result = await mlPost<any, any>('/anomalies/attendance', payload);
  return result || { anomalies: [] };
}

export async function getAttendanceHealthScore(payload: any): Promise<MlAttendanceHealthResponse> {
  const result = await mlPost<any, MlAttendanceHealthResponse>('/anomalies/health', payload);
  return result || { employee_scores: [], department_scores: [] };
}

export async function getLeavePrediction(dept: string, month: string): Promise<MlLeavePredictionResponse> {
  const result = await mlGet<MlLeavePredictionResponse>(`/predictions/leave?dept=${encodeURIComponent(dept)}&month=${encodeURIComponent(month)}`);
  return result || { department_id: dept, target_month: month, expected_leave_days: 0 };
}

export async function getSalaryForecast(payload: any): Promise<MlSalaryForecastResponse> {
  const result = await mlPost<any, MlSalaryForecastResponse>('/forecast/salary', payload);
  return result || { department_id: payload.department_id, projected_cost: 0, confidence_interval: [0, 0] };
}

export async function getAttritionRisk(payload: any): Promise<MlAttritionRiskResponse> {
  const result = await mlPost<any, MlAttritionRiskResponse>('/risk/attrition', payload);
  return result || { employee_id: payload.employee_id, risk_level: "Low", factors: [] };
}

export async function sendNlpQuery(payload: any): Promise<MlNlpQueryResponse> {
  const result = await mlPost<any, MlNlpQueryResponse>('/nlp/query', payload);
  return result || { answer: "ML Service is currently unavailable.", raw_sql: "", confidence: 0 };
}

export async function isMlServiceHealthy(): Promise<boolean> {
  const result = await mlGet<unknown>('/health');
  return result !== null;
}
