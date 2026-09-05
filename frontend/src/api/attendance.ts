// Mock Attendance API client using in‑memory data
import type { Attendance, AttendanceAudit } from '../types/index';

// Initial mock data
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
    // missing checkout → Missing Check‑out status
    status: 'Missing Check-out',
  },
];

let auditLog: AttendanceAudit[] = [];

/** Fetch all attendance records */
export const getAttendance = async (): Promise<Attendance[]> => {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 150));
  return [...attendanceData];
};

/** Update a single attendance record and record an audit entry */
export const updateAttendance = async (
  id: string,
  updates: Partial<Pick<Attendance, 'checkIn' | 'checkOut' | 'status'>>,
  correctedBy: string
): Promise<Attendance> => {
  await new Promise((r) => setTimeout(r, 150));
  const idx = attendanceData.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Attendance not found');
  const original = attendanceData[idx];
  const updated = { ...original, ...updates, updatedAt: new Date().toISOString() };
  attendanceData[idx] = updated;

  // Record audit entries for each changed field
  (Object.keys(updates) as (keyof typeof updates)[]).forEach((field) => {
    if (original[field] !== updates[field]) {
      auditLog.push({
        attendanceId: id,
        field: field as any,
        originalValue: String(original[field]),
        newValue: String(updates[field]),
        correctedBy,
        correctedAt: new Date().toISOString(),
      });
    }
  });

  return updated;
};

/** Retrieve audit entries for a given attendance record */
export const getAttendanceAudit = async (id: string): Promise<AttendanceAudit[]> => {
  await new Promise((r) => setTimeout(r, 100));
  return auditLog.filter((a) => a.attendanceId === id);
};
