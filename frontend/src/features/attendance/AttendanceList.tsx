// Attendance feature — AttendanceList
// Global + per-employee filtered table view of attendance records.

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Spinner, Button } from '../../components';
import { getAttendance } from '../../api/attendance';
import type { Attendance, AttendanceStatus } from '../../types';
import { AttendanceCorrectionModal } from './AttendanceCorrectionModal';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

const statusVariant: Record<AttendanceStatus, BadgeVariant> = {
  'On Time': 'success',
  Late: 'warning',
  Absent: 'danger',
  Overtime: 'primary',
  'Missing Check-out': 'warning',
};

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatHours(h?: number): string {
  if (h == null) return '—';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins}m`;
}

interface AttendanceListProps {
  /** If supplied, only show records for this employee */
  employeeId?: string;
}

export const AttendanceList: React.FC<AttendanceListProps> = ({ employeeId }) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendance'],
    queryFn: getAttendance,
  });

  const [filterEmployee, setFilterEmployee] = useState(employeeId || '');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | ''>('');
  const [correctionRecord, setCorrectionRecord] = useState<Attendance | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data;
    if (filterEmployee) {
      list = list.filter((r) => r.employeeId === filterEmployee);
    }
    if (filterStatus) {
      list = list.filter((r) => r.status === filterStatus);
    }
    return list;
  }, [data, filterEmployee, filterStatus]);

  // Unique employees for dropdown
  const employees = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, string>();
    data.forEach((r) => map.set(r.employeeId, r.employeeName));
    return Array.from(map.entries());
  }, [data]);

  /* ── Loading skeleton ──────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" label="Loading attendance…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-danger-600">
        <p className="font-medium">Failed to load attendance records.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* ── Toolbar / Filters ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {!employeeId && (
          <select
            id="att-filter-employee"
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="text-sm rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">All Employees</option>
            {employees.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}

        <select
          id="att-filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | '')}
          className="text-sm rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="">All Statuses</option>
          {(['On Time', 'Late', 'Absent', 'Overtime', 'Missing Check-out'] as AttendanceStatus[]).map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>

        <span className="ml-auto text-xs text-neutral-400">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-neutral-50/80 text-neutral-500 uppercase text-[11px] tracking-wider">
              {!employeeId && <th className="px-5 py-3 font-semibold">Employee</th>}
              <th className="px-5 py-3 font-semibold">Check In</th>
              <th className="px-5 py-3 font-semibold">Check Out</th>
              <th className="px-5 py-3 font-semibold">Worked Hours</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={employeeId ? 5 : 6}
                  className="px-5 py-12 text-center text-neutral-400"
                >
                  No attendance records found.
                </td>
              </tr>
            )}
            {filtered.map((rec) => (
              <tr
                key={rec.id}
                className="hover:bg-primary-50/30 transition-colors duration-100"
              >
                {!employeeId && (
                  <td className="px-5 py-3 font-medium text-neutral-800 whitespace-nowrap">
                    {rec.employeeName}
                  </td>
                )}
                <td className="px-5 py-3 text-neutral-600 whitespace-nowrap">
                  {formatDateTime(rec.checkIn)}
                </td>
                <td className="px-5 py-3 text-neutral-600 whitespace-nowrap">
                  {formatDateTime(rec.checkOut)}
                </td>
                <td className="px-5 py-3 text-neutral-600 whitespace-nowrap">
                  {formatHours(rec.workedHours)}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <Badge variant={statusVariant[rec.status]} size="sm" dot>
                    {rec.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCorrectionRecord(rec)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                    Correct
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Correction Modal ───────────────────────────────────────── */}
      {correctionRecord && (
        <AttendanceCorrectionModal
          record={correctionRecord}
          onClose={() => {
            setCorrectionRecord(null);
            refetch();
          }}
        />
      )}
    </>
  );
};
