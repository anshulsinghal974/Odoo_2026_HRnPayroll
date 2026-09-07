// Payrun API Client
// Calls real backend at /api/payruns/* with mock fallback for offline dev.

import { apiClient } from './client';
import type { SalaryStructure, Payrun, PayrunStatus } from '../types';

// ── Mock fallback data ─────────────────────────────────────────────────────────
let mockSalaryStructures: SalaryStructure[] = [
  {
    id: 'ss1',
    name: 'Standard Salary',
    description: 'Base salary structure',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ss2',
    name: 'Executive',
    description: 'Higher compensation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockPayruns: Payrun[] = [];

// ── Backend response shapes ────────────────────────────────────────────────────

interface BackendSalaryStructure {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendPayrun {
  id: string;
  name?: string;
  structureId?: string;
  salaryStructureId?: string;       // frontend alias — may come back as either
  periodStart: string;
  periodEnd: string;
  status: string;
  totalAmount?: number | null;
  notes?: string | null;
  employeeIds?: string[];
  payslips?: { employeeId: string }[];
  createdAt: string;
  updatedAt: string;
}

interface BackendListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Map backend SalaryStructure → frontend type */
function mapStructure(s: BackendSalaryStructure): SalaryStructure {
  return {
    id:          s.id,
    name:        s.name,
    description: s.description ?? undefined,
    createdAt:   s.createdAt,
    updatedAt:   s.updatedAt,
  };
}

/** Map backend Payrun → frontend Payrun type */
function mapPayrun(p: BackendPayrun): Payrun {
  // Backend uses structureId; frontend type uses salaryStructureId
  const salaryStructureId = p.salaryStructureId ?? p.structureId ?? '';

  // Reconstruct employeeIds from nested payslips if not directly present
  const employeeIds =
    p.employeeIds ??
    (p.payslips ? p.payslips.map(ps => ps.employeeId) : []);

  return {
    id:               p.id,
    salaryStructureId,
    periodStart:      p.periodStart,
    periodEnd:        p.periodEnd,
    employeeIds,
    status:           p.status as PayrunStatus,
    totalAmount:      p.totalAmount ?? undefined,
    notes:            p.notes ?? undefined,
    createdAt:        p.createdAt,
    updatedAt:        p.updatedAt,
  };
}

// ── API functions ──────────────────────────────────────────────────────────────

/**
 * GET /api/salary-structures
 * Fetch all available salary structures for the payrun wizard Step 1.
 */
export const getSalaryStructures = async (): Promise<SalaryStructure[]> => {
  try {
    const res = await apiClient.get<BackendSalaryStructure[] | BackendListResponse<BackendSalaryStructure>>(
      '/salary-structures'
    );
    const raw = Array.isArray(res.data)
      ? res.data
      : (res.data as BackendListResponse<BackendSalaryStructure>).data;
    return raw.map(mapStructure);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    return [...mockSalaryStructures];
  }
};

/**
 * GET /api/payruns
 * List all payruns (paginated).
 */
export const getPayruns = async (status?: PayrunStatus): Promise<Payrun[]> => {
  try {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const res = await apiClient.get<BackendListResponse<BackendPayrun> | BackendPayrun[]>(
      '/payruns',
      { params }
    );
    const raw = Array.isArray(res.data)
      ? res.data
      : (res.data as BackendListResponse<BackendPayrun>).data;
    return raw.map(mapPayrun);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    if (status) return mockPayruns.filter(p => p.status === status);
    return [...mockPayruns];
  }
};

/**
 * GET /api/payruns/:id
 * Fetch a single payrun by ID.
 */
export const getPayrun = async (id: string): Promise<Payrun | undefined> => {
  try {
    const res = await apiClient.get<BackendPayrun>(`/payruns/${id}`);
    return mapPayrun(res.data);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    return mockPayruns.find(p => p.id === id);
  }
};

/**
 * POST /api/payruns
 * Create a new payrun (Wizard Step 2).
 *
 * Backend requires: name, structureId, periodStart, periodEnd, employeeIds
 * Frontend sends:   salaryStructureId — we map it to structureId here.
 */
export const createPayrun = async (data: {
  salaryStructureId: string;
  periodStart: string;
  periodEnd: string;
  employeeIds: string[];
  name?: string;
  notes?: string;
}): Promise<Payrun> => {
  try {
    const payload = {
      name:        data.name ?? `Payrun ${data.periodStart} – ${data.periodEnd}`,
      structureId: data.salaryStructureId,   // backend field name
      periodStart: data.periodStart,
      periodEnd:   data.periodEnd,
      employeeIds: data.employeeIds,
      notes:       data.notes,
    };
    const res = await apiClient.post<BackendPayrun>('/payruns', payload);
    const created = mapPayrun(res.data);
    mockPayruns.push(created);              // keep mock in sync
    return created;
  } catch {
    await new Promise(r => setTimeout(r, 150));
    const newPayrun: Payrun = {
      id:               `pr-${Date.now()}`,
      salaryStructureId: data.salaryStructureId,
      periodStart:      data.periodStart,
      periodEnd:        data.periodEnd,
      employeeIds:      data.employeeIds,
      status:           'Draft',
      notes:            data.notes,
      createdAt:        new Date().toISOString(),
      updatedAt:        new Date().toISOString(),
    };
    mockPayruns.push(newPayrun);
    return newPayrun;
  }
};

/**
 * POST /api/payruns/:id/compute
 * Compute all payslips — moves payrun from Draft → Computed.
 */
export const computePayrun = async (id: string): Promise<Payrun> => {
  try {
    const res = await apiClient.post<BackendPayrun>(`/payruns/${id}/compute`);
    const updated = mapPayrun(res.data);
    _syncMock(updated);
    return updated;
  } catch {
    await new Promise(r => setTimeout(r, 150));
    return _mockStatusChange(id, 'Computed');
  }
};

/**
 * POST /api/payruns/:id/validate
 * Validate payrun — moves from Computed → Validated.
 */
export const validatePayrun = async (id: string): Promise<Payrun> => {
  try {
    const res = await apiClient.post<BackendPayrun>(`/payruns/${id}/validate`);
    const updated = mapPayrun(res.data);
    _syncMock(updated);
    return updated;
  } catch {
    await new Promise(r => setTimeout(r, 150));
    return _mockStatusChange(id, 'Validated');
  }
};

/**
 * POST /api/payruns/:id/mark-paid
 * Mark payrun as paid — moves from Validated → Paid.
 */
export const markPayrunPaid = async (id: string): Promise<Payrun> => {
  try {
    const res = await apiClient.post<BackendPayrun>(`/payruns/${id}/mark-paid`);
    const updated = mapPayrun(res.data);
    _syncMock(updated);
    return updated;
  } catch {
    await new Promise(r => setTimeout(r, 150));
    return _mockStatusChange(id, 'Paid');
  }
};

/**
 * POST /api/payruns/:id/send
 * Bulk email payslips to all employees in this payrun.
 */
export const sendPayrun = async (id: string): Promise<void> => {
  try {
    await apiClient.post(`/payruns/${id}/send`);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    // mock — no state change needed
  }
};

/**
 * POST /api/payruns/eligible-employees
 * Wizard Step 1: get eligible employees for a structure + period.
 */
export const getEligibleEmployees = async (data: {
  structureId: string;
  periodStart: string;
  periodEnd: string;
}): Promise<{ id: string; name: string; department: string; jobPosition: string }[]> => {
  try {
    const res = await apiClient.post<{
      eligibleEmployees: { id: string; firstName: string; lastName: string; department?: string; jobPosition?: string }[];
    }>('/payruns/eligible-employees', data);
    return res.data.eligibleEmployees.map(e => ({
      id:          e.id,
      name:        `${e.firstName} ${e.lastName}`.trim(),
      department:  e.department ?? '',
      jobPosition: e.jobPosition ?? '',
    }));
  } catch {
    // Fallback — return empty list so wizard still works
    await new Promise(r => setTimeout(r, 150));
    return [];
  }
};

// ── Internal mock helpers ──────────────────────────────────────────────────────

function _syncMock(updated: Payrun): void {
  const idx = mockPayruns.findIndex(p => p.id === updated.id);
  if (idx !== -1) mockPayruns[idx] = updated;
  else mockPayruns.push(updated);
}

function _mockStatusChange(id: string, status: PayrunStatus): Payrun {
  const idx = mockPayruns.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Payrun not found');
  mockPayruns[idx] = { ...mockPayruns[idx], status, updatedAt: new Date().toISOString() };
  return mockPayruns[idx];
}
