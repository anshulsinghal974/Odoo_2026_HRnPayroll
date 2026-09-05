import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TimeOffUnit, TimeOffApprovalWorkflow } from '../../types';
import { getTimeOffTypes, createTimeOffType } from '../../api/timeoff';
import { Button, Card, Badge, Spinner, Modal } from '../../components';
import { Plus, Settings, Check, X, Layers } from 'lucide-react';

export const TimeOffTypeConfig: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState<TimeOffUnit>('Days');
  const [approvalWorkflow, setApprovalWorkflow] = useState<TimeOffApprovalWorkflow>('By HR Manager');
  const [requiresAllocation, setRequiresAllocation] = useState(true);
  const [carryOverDays, setCarryOverDays] = useState(0);

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['timeOffTypes'],
    queryFn: getTimeOffTypes,
  });

  const createMutation = useMutation({
    mutationFn: createTimeOffType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffTypes'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setCode('');
    setUnit('Days');
    setApprovalWorkflow('By HR Manager');
    setRequiresAllocation(true);
    setCarryOverDays(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      code: code.toUpperCase() || name.substring(0, 4).toUpperCase(),
      unit,
      approvalWorkflow,
      requiresAllocation,
      carryOverDays,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-600" /> Time Off Type Configurations
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure leave categories, time measurement units, approval workflows, and carry-over rules
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Leave Type
        </Button>
      </div>

      {/* Types List Table */}
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
                  <th className="px-4 py-3">Type Name & Code</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Approval Workflow</th>
                  <th className="px-4 py-3">Requires Allocation?</th>
                  <th className="px-4 py-3">Max Carry-over</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {types.map((type) => (
                  <tr key={type.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-xs">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{type.name}</p>
                          <span className="text-[11px] font-mono text-neutral-400">
                            Code: {type.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={type.unit === 'Days' ? 'primary' : 'warning'}>
                        {type.unit}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-medium text-neutral-800">{type.approvalWorkflow}</span>
                    </td>

                    <td className="px-4 py-3">
                      {type.requiresAllocation ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                          <Check className="w-3.5 h-3.5" /> Yes (Mandatory)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neutral-400 text-xs">
                          <X className="w-3.5 h-3.5" /> No (Direct Request)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono font-semibold text-neutral-800">
                      {type.carryOverDays > 0 ? `${type.carryOverDays} ${type.unit}` : 'None (0)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Leave Type Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Time Off Type Configuration"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Type Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Parental Leave, Compassionate Leave"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Category Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 uppercase"
                placeholder="e.g. MATERNITY"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Time Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as TimeOffUnit)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="Days">Days</option>
                <option value="Hours">Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Approval Workflow
            </label>
            <select
              value={approvalWorkflow}
              onChange={(e) => setApprovalWorkflow(e.target.value as TimeOffApprovalWorkflow)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="By HR Manager">By HR Manager</option>
              <option value="By Time Off Officer">By Time Off Officer</option>
              <option value="No Validation">No Validation (Auto Approve)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="reqAlloc"
                checked={requiresAllocation}
                onChange={(e) => setRequiresAllocation(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-neutral-300 cursor-pointer"
              />
              <label htmlFor="reqAlloc" className="text-xs font-medium text-neutral-700 cursor-pointer">
                Requires Pre-Allocation
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Max Carry-Over ({unit})
              </label>
              <input
                type="number"
                min="0"
                value={carryOverDays}
                onChange={(e) => setCarryOverDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Configuration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
