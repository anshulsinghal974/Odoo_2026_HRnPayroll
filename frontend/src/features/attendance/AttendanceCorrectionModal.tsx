// Attendance feature — Manual Correction Modal
// Allows editing Check In / Check Out times and displays an audit trail.

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Badge, Spinner } from '../../components';
import { updateAttendance, getAttendanceAudit } from '../../api/attendance';
import type { Attendance, AttendanceAudit } from '../../types';

interface AttendanceCorrectionModalProps {
  record: Attendance;
  onClose: () => void;
}

function toLocalDateTimeInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  // yyyy-MM-ddTHH:mm format for datetime-local input
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatAuditDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const AttendanceCorrectionModal: React.FC<AttendanceCorrectionModalProps> = ({
  record,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const [checkIn, setCheckIn] = useState(toLocalDateTimeInput(record.checkIn));
  const [checkOut, setCheckOut] = useState(toLocalDateTimeInput(record.checkOut));
  const [saveError, setSaveError] = useState('');

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['attendance-audit', record.id],
    queryFn: () => getAttendanceAudit(record.id),
  });

  const mutation = useMutation({
    mutationFn: (updates: Partial<Pick<Attendance, 'checkIn' | 'checkOut'>>) =>
      updateAttendance(record.id, updates, 'Admin (current user)'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-audit', record.id] });
      onClose();
    },
    onError: (err: Error) => setSaveError(err.message),
  });

  const handleSave = () => {
    setSaveError('');
    const updates: Partial<Pick<Attendance, 'checkIn' | 'checkOut'>> = {};

    if (checkIn && checkIn !== toLocalDateTimeInput(record.checkIn)) {
      updates.checkIn = new Date(checkIn).toISOString();
    }
    if (checkOut && checkOut !== toLocalDateTimeInput(record.checkOut)) {
      updates.checkOut = new Date(checkOut).toISOString();
    }

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    mutation.mutate(updates);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Correct Attendance Record"
      description={`Editing record for ${record.employeeName}`}
      size="lg"
      footer={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Spinner size="xs" color="white" className="mr-1.5" />
            ) : null}
            Save Correction
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── Editable Fields ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="corr-checkin"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              Check In
            </label>
            <input
              id="corr-checkin"
              type="datetime-local"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label
              htmlFor="corr-checkout"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              Check Out
            </label>
            <input
              id="corr-checkout"
              type="datetime-local"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        {saveError && (
          <p className="text-xs text-danger-600 font-medium">{saveError}</p>
        )}

        {/* ── Audit Trail ──────────────────────────────────────────── */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Audit Trail
          </h3>

          {auditLoading ? (
            <Spinner size="sm" label="Loading audit log…" />
          ) : !auditData || auditData.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">
              No corrections have been made to this record yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-50/80 text-neutral-500 uppercase tracking-wider">
                    <th className="px-4 py-2.5 font-semibold">Field</th>
                    <th className="px-4 py-2.5 font-semibold">Original Value</th>
                    <th className="px-4 py-2.5 font-semibold">New Value</th>
                    <th className="px-4 py-2.5 font-semibold">Corrected By</th>
                    <th className="px-4 py-2.5 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {auditData.map((entry: AttendanceAudit, idx: number) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-2 text-neutral-700 capitalize">
                        <Badge variant="neutral" size="sm">
                          {entry.field === 'checkIn'
                            ? 'Check In'
                            : entry.field === 'checkOut'
                            ? 'Check Out'
                            : entry.field}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-neutral-500 line-through">
                        {entry.originalValue === 'undefined'
                          ? '—'
                          : new Date(entry.originalValue).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2 text-neutral-800 font-medium">
                        {new Date(entry.newValue).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">{entry.correctedBy}</td>
                      <td className="px-4 py-2 text-neutral-400">
                        {formatAuditDate(entry.correctedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
