import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LeaveRequestStatus, TimeOffUnit } from '../../types';
import {
  getTimeOffRequests,
  createTimeOffRequest,
  updateRequestStatus,
  getLeaveBalances,
  getTimeOffTypes,
} from '../../api/timeoff';
import { Button, Card, CardContent, Badge, Spinner, Modal } from '../../components';
import { useAuth } from '../auth';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Calendar,
  User,
  Clock,
  PieChart,
} from 'lucide-react';

export const RequestList: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine if logged-in user can approve/refuse requests (HR roles only)
  const canApprove = role === 'Admin' || role === 'HR Manager' || role === 'HR Payroll Manager';

  // Use the actual logged-in user's info — not hardcoded
  const employeeId = user?.employeeId ?? 'emp-101';
  const employeeName = user?.name ?? '';

  const [timeOffTypeId, setTimeOffTypeId] = useState('tot-1');
  const [startDate, setStartDate] = useState('2026-08-10');
  const [endDate, setEndDate] = useState('2026-08-14');
  const [duration, setDuration] = useState(5);
  const [reason, setReason] = useState('');

  // Queries
  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['timeOffRequests'],
    queryFn: () => getTimeOffRequests(),
  });

  const { data: balances = [], isLoading: isLoadingBalances } = useQuery({
    queryKey: ['leaveBalances', employeeId],
    queryFn: () => getLeaveBalances(employeeId),
  });

  const { data: types = [] } = useQuery({
    queryKey: ['timeOffTypes'],
    queryFn: getTimeOffTypes,
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeaveRequestStatus }) =>
      updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: createTimeOffRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      setIsModalOpen(false);
      setReason('');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeObj = types.find((t) => t.id === timeOffTypeId);

    createMutation.mutate({
      employeeId,
      employeeName,
      timeOffTypeId,
      timeOffTypeName: typeObj?.name || 'Paid Annual Leave',
      startDate,
      endDate,
      duration,
      unit: typeObj?.unit || ('Days' as TimeOffUnit),
      status: 'Pending',
      reason,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Balance Display Header Cards ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary-600" /> Leave Balance Overview ({employeeName || 'Your Account'})
          </h3>
          <span className="text-xs text-neutral-500 font-mono">Employee ID: {employeeId}</span>
        </div>

        {isLoadingBalances ? (
          <div className="p-4 flex justify-center bg-white rounded-xl border border-neutral-200">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {balances.map((b) => (
              <Card key={b.timeOffTypeId} className="border border-neutral-200 bg-white">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 truncate">
                      {b.timeOffTypeName}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {b.unit}
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-extrabold text-primary-700 font-mono">
                        {b.remaining}
                      </span>
                      <span className="text-[11px] text-neutral-500 ml-1">remaining</span>
                    </div>

                    <div className="text-right text-[11px] text-neutral-500">
                      <div>
                        Allocated: <span className="font-semibold text-neutral-800">{b.allocated}</span>
                      </div>
                      <div>
                        Used: <span className="font-semibold text-amber-700">{b.used}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-600 h-full transition-all"
                      style={{
                        width: `${Math.min(100, (b.remaining / (b.allocated || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Time Off Requests List Section ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" /> Time Off Requests
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Submit leave applications and approve employee time off requests
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Submit Time Off Request
        </Button>
      </div>

      {isLoadingRequests ? (
        <div className="p-8 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Leave Category</th>
                  <th className="px-4 py-3">Dates (Start – End)</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Approve / Refuse Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-400" />
                        <div>
                          <p className="font-semibold">{req.employeeName}</p>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {req.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-neutral-800">
                      {req.timeOffTypeName}
                    </td>

                    <td className="px-4 py-3 text-neutral-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>
                          {req.startDate} → {req.endDate}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-neutral-900">
                      <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">
                        {req.duration} {req.unit}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-neutral-600 max-w-[180px] truncate">
                      {req.reason || 'No reason specified'}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          req.status === 'Approved'
                            ? 'success'
                            : req.status === 'Pending'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {req.status}
                      </Badge>
                    </td>

                    {/* Approve / Refuse Buttons */}
                    <td className="px-4 py-3 text-right">
                      {req.status === 'Pending' && canApprove ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              statusMutation.mutate({ id: req.id, status: 'Approved' })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-semibold text-xs transition-colors border border-emerald-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() =>
                              statusMutation.mutate({ id: req.id, status: 'Refused' })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-semibold text-xs transition-colors border border-red-200"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Refuse
                          </button>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-[11px]">
                          {req.status === 'Pending' ? 'Awaiting approval' : req.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* New Request Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Time Off Request"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Show who is submitting — read-only, from logged-in user */}
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg">
            <User className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700">{employeeName}</span>
            <span className="text-xs text-neutral-400 font-mono ml-auto">{employeeId}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Leave Category
              </label>
              <select
                value={timeOffTypeId}
                onChange={(e) => setTimeOffTypeId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Duration Amount
              </label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Reason / Justification
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              placeholder="e.g. Vacation trip, medical checkup"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
