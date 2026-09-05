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
// Extend / modify these when Person 3 documents the actual contract.
// ──────────────────────────────────────────────

export interface MlPayrunReadinessResponse {
  readinessScore: number;          // 0–100
  warnings: MlWarning[];
}

export interface MlWarning {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  employeeId?: string;
}

export interface MlAttritionRiskEmployee {
  employeeId: string;
  riskScore: number;    // 0–1
  reasons: string[];
}

export interface MlAttritionRiskResponse {
  employees: MlAttritionRiskEmployee[];
}

export interface MlAnomalyDetectionResponse {
  anomalies: Array<{
    payslipId: string;
    reason: string;
    confidence: number;
  }>;
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

/**
 * POST /api/warnings/payrun-readiness
 * Returns readiness score + ML-generated warnings for a payrun.
 * Fallback: { readinessScore: 100, warnings: [] }
 */
export async function getPayrunReadiness(
  payrunId: string
): Promise<MlPayrunReadinessResponse> {
  const result = await mlPost<{ payrunId: string }, MlPayrunReadinessResponse>(
    '/api/warnings/payrun-readiness',
    { payrunId }
  );

  if (!result) {
    return { readinessScore: 100, warnings: [] };
  }

  return result;
}

/**
 * POST /api/attrition/predict
 * Returns attrition risk scores for a list of employee IDs.
 * Fallback: { employees: [] }
 */
export async function getAttritionRisk(
  employeeIds: string[]
): Promise<MlAttritionRiskResponse> {
  const result = await mlPost<{ employeeIds: string[] }, MlAttritionRiskResponse>(
    '/api/attrition/predict',
    { employeeIds }
  );

  if (!result) {
    return { employees: [] };
  }

  return result;
}

/**
 * POST /api/anomaly/payslips
 * Flags payslips with statistically unusual values.
 * Fallback: { anomalies: [] }
 */
export async function detectPayslipAnomalies(
  payrunId: string
): Promise<MlAnomalyDetectionResponse> {
  const result = await mlPost<{ payrunId: string }, MlAnomalyDetectionResponse>(
    '/api/anomaly/payslips',
    { payrunId }
  );

  if (!result) {
    return { anomalies: [] };
  }

  return result;
}

/**
 * GET /api/health
 * Check whether the ML service is reachable.
 * Returns true if reachable, false otherwise.
 */
export async function isMlServiceHealthy(): Promise<boolean> {
  const result = await mlGet<unknown>('/api/health');
  return result !== null;
}
