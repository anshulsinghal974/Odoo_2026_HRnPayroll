// Payrun Wizard UI – two-step creation flow

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Badge, Spinner } from '../../components';
import { useNavigate } from 'react-router-dom';
import { createPayrun, getSalaryStructures } from '../../api/payruns';
import { getEmployees } from '../../api/employees';

export const PayrunWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedStructure, setSelectedStructure] = useState<string>('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Load data
  const {
    data: structures,
    isLoading: loadingStructures,
    isError: errStructures,
  } = useQuery({
    queryKey: ['salaryStructures'],
    queryFn: getSalaryStructures,
  });

  const {
    data: employees,
    isLoading: loadingEmployees,
    isError: errEmployees,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 2));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createPayrunMutation = useMutation({
    mutationFn: (data: { salaryStructureId: string; periodStart: string; periodEnd: string; employeeIds: string[] }) => createPayrun(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payrun', data.id] });
      navigate(`/payroll/${data.id}`);
    },
  });

  // ---------- Step 1 UI ----------
  const renderStep1 = () => (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Step 1 – Salary Structure & Period</h2>

      {/* Salary Structure selector */}
      {loadingStructures ? (
        <Spinner size="lg" label="Loading salary structures…" />
      ) : errStructures ? (
        <p className="text-danger-600">Failed to load salary structures.</p>
      ) : (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Salary Structure</label>
          <select
            value={selectedStructure}
            onChange={(e) => setSelectedStructure(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">Select a structure</option>
            {structures?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Period pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Period Start</label>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Period End</label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="primary" size="sm" onClick={nextStep} disabled={!selectedStructure || !periodStart || !periodEnd}>
          Continue to Employees
        </Button>
      </div>
    </Card>
  );

  // ---------- Step 2 UI ----------
  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const renderStep2 = () => (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Step 2 – Select Employees</h2>

      {/* Employee multi‑select list */}
      {loadingEmployees ? (
        <Spinner size="lg" label="Loading employees…" />
      ) : errEmployees ? (
        <p className="text-danger-600">Failed to load employees.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto border border-neutral-200 rounded-lg p-3">
          {employees?.map((emp) => (
            <label key={emp.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEmployees.includes(emp.id)}
                onChange={() => toggleEmployee(emp.id)}
                className="form-checkbox h-4 w-4 rounded text-primary-600 border-neutral-300"
              />
              <span className="text-sm text-neutral-800">{emp.name} – {emp.department}</span>
            </label>
          ))}
        </div>
      )}

      <div className="flex justify-between gap-3 pt-4">
        <Button variant="outline" size="sm" onClick={prevStep}>
          Back
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            createPayrunMutation.mutate({
              salaryStructureId: selectedStructure,
              periodStart,
              periodEnd,
              employeeIds: selectedEmployees,
            });
          }}
          disabled={selectedEmployees.length === 0 || createPayrunMutation.isPending}
        >
          {createPayrunMutation.isPending ? <Spinner size="sm" /> : 'Finish (submit)'}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center mb-6 space-x-2">
        <Badge variant={step === 1 ? 'primary' : 'neutral'} size="sm" dot>
          Step 1
        </Badge>
        <Badge variant={step === 2 ? 'primary' : 'neutral'} size="sm" dot>
          Step 2
        </Badge>
      </div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  );
};
