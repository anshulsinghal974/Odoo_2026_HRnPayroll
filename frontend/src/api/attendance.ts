// Attendance API Client
// Calls real backend at /api/attendances with mock fallback for offline dev.

import { apiClient } from './client';
import type { Attendance, AttendanceAudit, AttendanceStatus } from '../types/index';

// ── Mock fallback data ─────────────────────────────────────────────────────────
let attendanceData: Attendance[] = [
  {
    id: 'a1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    employeeId: 'e1',
    employeeName: 'Alice Johnson',
    checkIn: '2026-09-04T08:45:00Z',
    checkOut: '2026-09-04T17:15:00Z',
    workedHours: 8.5,
    status: 'On Time',
  },
  {
    id: 'a2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    employeeId: 'e2',
    employeeName: 'Bob Smith',
    checkIn: '2026-09-04T09:15:00Z',
    status: 'Missing Check-out',
  },
];

let mockAuditLog: AttendanceAudit[] = [];

// ── Backend response shape ─────────────────────────────────────────────────────
// Backend returns employee as a nested object — we flatten it for the frontend.
interface BackendAttendance {
  id: string;
  employeeId: string;
  checkIn: string;
  checkOut?: string | null;
  workedHours?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string | null;
    jobPosition?: string | null;
  } | null;
}

interface BackendListResponse {
  data: BackendAttendance[];
  total: number;
  page: number;
  limit: number;
}

/** Map backend shape → frontend Attendance type */
function mapBackend(r: BackendAttendance): Attendance {
  const name = r.employee
    ? `${r.employee.firstName} ${r.employee.lastName}`.trim()
    : r.employeeId;

  return {
    id:           r.id,
    employeeId:   r.employeeId,
    employeeName: name,
    checkIn:      r.checkIn,
    checkOut:     r.checkOut ?? undefined,
    workedHours:  r.workedHours ?? undefined,
    status:       (r.status as AttendanceStatus),
    createdAt:    r.createdAt,
    updatedAt:    r.updatedAt,
  };
}

// ── API functions ──────────────────────────────────────────────────────────────

/**
 * GET /api/attendances
 * Fetch all attendance records (backend filters by role automatically).
 */
export const getAttendance = async (employeeId?: string): Promise<Attendance[]> => {
  try {
    const params: Record<string, string> = {};
    if (employeeId) params.employeeId = employeeId;

    const res = await apiClient.get<BackendListResponse | BackendAttendance[]>(
      '/attendances',
      { params }
    );

    // Backend may return paginated { data: [...] } or a plain array
    const raw = Array.isArray(res.data) ? res.data : (res.data as BackendListResponse).data;
    return raw.map(mapBackend);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    if (employeeId) {
      return attendanceData.filter(a => a.employeeId === employeeId);
    }
    return [...attendanceData];
  }
};

/**
 * GET /api/attendances/:id
 * Fetch a single attendance record by ID.
 */
export const getAttendanceById = async (id: string): Promise<Attendance> => {
  try {
    const res = await apiClient.get<BackendAttendance>(`/attendances/${id}`);
    return mapBackend(res.data);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    const found = attendanceData.find(a => a.id === id);
    if (!found) throw new Error('Attendance record not found');
    return found;
  }
};

/**
 * POST /api/attendances
 * Create a new attendance record (check-in).
 */
export const createAttendance = async (data: {
  employeeId: string;
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
}): Promise<Attendance> => {
  try {
    const res = await apiClient.post<BackendAttendance>('/attendances', data);
    return mapBackend(res.data);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    const newRecord: Attendance = {
      id:           `a-${Date.now()}`,
      employeeId:   data.employeeId,
      employeeName: data.employeeId,
      checkIn:      data.checkIn ?? new Date().toISOString(),
      checkOut:     data.checkOut,
      status:       data.status ?? 'On Time',
      createdAt:    new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
    };
    attendanceData = [newRecord, ...attendanceData];
    return newRecord;
  }
};

/**
 * POST /api/attendances/:id/checkout
 * Record check-out time for an attendance record.
 */
export const checkOutAttendance = async (
  id: string,
  checkOut?: string
): Promise<Attendance> => {
  try {
    const res = await apiClient.post<BackendAttendance>(
      `/attendances/${id}/checkout`,
      { checkOut: checkOut ?? new Date().toISOString() }
    );
    return mapBackend(res.data);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    const idx = attendanceData.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Attendance record not found');
    const updated: Attendance = {
      ...attendanceData[idx],
      checkOut:  checkOut ?? new Date().toISOString(),
      status:    'On Time',
      updatedAt: new Date().toISOString(),
    };
    attendanceData[idx] = updated;
    return updated;
  }
};

/**
 * PUT /api/attendances/:id
 * Manual correction — updates checkIn / checkOut with a mandatory audit note.
 * Backend requires `correctionNote` field.
 */
export const updateAttendance = async (
  id: string,
  updates: Partial<Pick<Attendance, 'checkIn' | 'checkOut' | 'status'>>,
  correctedBy: string
): Promise<Attendance> => {
  try {
    const res = await apiClient.put<BackendAttendance>(`/attendances/${id}`, {
      ...updates,
      correctionNote: `Corrected by ${correctedBy}`,
    });
    return mapBackend(res.data);
  } catch {
    await new Promise(r => setTimeout(r, 150));
    const idx = attendanceData.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Attendance not found');

    const original = attendanceData[idx];
    const updated: Attendance = {
      ...original,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    attendanceData[idx] = updated;

    // Record mock audit entries
    (Object.keys(updates) as (keyof typeof updates)[]).forEach(field => {
      if (original[field] !== updates[field]) {
        mockAuditLog.push({
          attendanceId:  id,
          field:         field as 'checkIn' | 'checkOut' | 'status',
          originalValue: String(original[field]),
          newValue:      String(updates[field]),
          correctedBy,
          correctedAt:   new Date().toISOString(),
        });
      }
    });

    return updated;
  }
};

/**
 * POST /api/attendances/:id/correct
 * Explicit correction endpoint (same as PUT but via POST route).
 */
export const correctAttendance = async (
  id: string,
  updates: Partial<Pick<Attendance, 'checkIn' | 'checkOut'>>,
  correctionNote: string,
  correctedBy: string
): Promise<Attendance> => {
  try {
    const res = await apiClient.post<BackendAttendance>(`/attendances/${id}/correct`, {
      ...updates,
      correctionNote,
    });
    return mapBackend(res.data);
  } catch {
    return updateAttendance(id, updates, correctedBy);
  }
};

/**
 * GET /api/attendances/:id/audit  (mock only — backend doesn't expose this yet)
 * Returns audit trail for a given attendance record.
 */
export const getAttendanceAudit = async (id: string): Promise<AttendanceAudit[]> => {
  try {
    const res = await apiClient.get<AttendanceAudit[]>(`/attendances/${id}/audit`);
    return res.data;
  } catch {
    await new Promise(r => setTimeout(r, 100));
    return mockAuditLog.filter(a => a.attendanceId === id);
  }
};
