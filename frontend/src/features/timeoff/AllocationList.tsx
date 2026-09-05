import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LeaveRequestStatus } from '../../types';
import { getAllocations, createAllocation, updateAllocationStatus, getTimeOffTypes } from '../../api/timeoff';
import { Button, Card, Badge, Spinner, Modal } from '../../components';
import { CheckCircle2, XCircle, Plus, Calendar, User, Award } from 'lucide-react';

export const AllocationList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for creating allocation
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('emp-101');
  const [timeOffTypeId, setTimeOffTypeId] = useState('tot-1');
  const [allocatedAmount, setAllocatedAmount] = useState(20);
  const [validityStart, setValidityStart] = useState('2026-01-01');
  const [validityEnd, setValidityEnd] = useState('2026-12-31');
  const [reason, setReason] = useState('');

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ['allocations'],
    queryFn: () => getAllocations(),
  });

  const { data: types = [] } = useQuery({
    queryKey: ['timeOffTypes'],
    queryFn: getTimeOffTypes,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeaveRequestStatus }) =>
      updateAllocationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: createAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setEmployeeName('');
    setEmployeeId('emp-101');
    setTimeOffTypeId('tot-1');
    setAllocatedAmount(20);
    setReason('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeObj = types.find((t) => t.id === timeOffTypeId);

    createMutation.mutate({
      employeeId,
      employeeName: employeeName || 'Sarah Connor',
      timeOffTypeId,
      timeOffTypeName: typeObj?.name || 'Paid Annual Leave',
      allocatedAmount,
      status: 'Approved',
      validityStart,
      validityEnd,
      reason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-600" /> Leave Allocations
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Grant annual leave days to employees and approve pending quota requests
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Grant Leave Allocation
        </Button>
      </div>

      {isLoading ? (
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
                  <th className="px-4 py-3">Time Off Type</th>
                  <th className="px-4 py-3">Allocated Quota</th>
                  <th className="px-4 py-3">Validity Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-400" />
                        <div>
                          <p className="font-semibold">{alloc.employeeName}</p>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {alloc.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-neutral-800">
                      {alloc.timeOffTypeName}
                    </td>

                    <td className="px-4 py-3 font-mono font-extrabold text-neutral-900">
                      <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                        +{alloc.allocatedAmount} Days
                      </span>
                    </td>

                    <td className="px-4 py-3 text-neutral-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>
                          {alloc.validityStart} → {alloc.validityEnd}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          alloc.status === 'Approved'
                            ? 'success'
                            : alloc.status === 'Pending'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {alloc.status}
                      </Badge>
                    </td>

                    {/* Approval Action Buttons Flow */}
                    <td className="px-4 py-3 text-right">
                      {alloc.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              statusMutation.mutate({ id: alloc.id, status: 'Approved' })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-semibold text-xs transition-colors border border-emerald-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() =>
                              statusMutation.mutate({ id: alloc.id, status: 'Refused' })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-semibold text-xs transition-colors border border-red-200"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Refuse
                          </button>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-[11px]">Action Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grant Allocation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Grant Leave Allocation"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              placeholder="e.g. Sarah Connor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Time Off Type
              </label>
              <select
                value={timeOffTypeId}
                onChange={(e) => setTimeOffTypeId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Amount (Days/Hours)
              </label>
              <input
                type="number"
                min="1"
                value={allocatedAmount}
                onChange={(e) => setAllocatedAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Validity Start
              </label>
              <input
                type="date"
                value={validityStart}
                onChange={(e) => setValidityStart(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Validity End</label>
              <input
                type="date"
                value={validityEnd}
                onChange={(e) => setValidityEnd(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Reason / Description</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              placeholder="e.g. Annual allocation 2026"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Grant Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
