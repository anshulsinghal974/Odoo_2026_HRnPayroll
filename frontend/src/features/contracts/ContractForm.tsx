import React from 'react';
import { useForm } from 'react-hook-form';
import type { Contract, CreateContractInput, ContractStatus } from '../../types';
import { Button, Card, CardContent, CardHeader } from '../../components';
import { ArrowLeft, Save, FileText } from 'lucide-react';

interface ContractFormProps {
  initialValues?: Contract;
  onSubmit: (data: CreateContractInput) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

interface FormFields {
  employeeId: string;
  employeeName: string;
  department: string;
  jobPosition: string;
  startDate: string;
  endDate: string;
  wage: number;
  salaryStructure: string;
  workingSchedule: string;
  status: ContractStatus;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      employeeId: initialValues?.employeeId || 'emp-101',
      employeeName: initialValues?.employeeName || '',
      department: initialValues?.department || 'Engineering',
      jobPosition: initialValues?.jobPosition || '',
      startDate: initialValues?.startDate || new Date().toISOString().split('T')[0],
      endDate: initialValues?.endDate || '',
      wage: initialValues?.wage || 5000,
      salaryStructure: initialValues?.salaryStructure || 'Standard Base Salary + Allowances',
      workingSchedule: initialValues?.workingSchedule || 'Standard 40h/week',
      status: initialValues?.status || 'Draft',
    },
  });

  const isEditMode = Boolean(initialValues?.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {isEditMode ? `Contract: ${initialValues?.id}` : 'Create New Contract'}
            </h1>
            <p className="text-xs text-neutral-500">
              Configure employment agreement, terms, base compensation, and schedule
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee & Role Information */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" /> Employee & Position Info
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('employeeName', { required: 'Employee name is required' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Sarah Connor"
                />
                {errors.employeeName && (
                  <p className="text-xs text-red-500 mt-1">{errors.employeeName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('employeeId', { required: 'Employee ID is required' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                  placeholder="e.g. emp-101"
                />
                {errors.employeeId && (
                  <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Department</label>
                <select
                  {...register('department')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Payroll">Finance & Payroll</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Job Position</label>
                <input
                  type="text"
                  {...register('jobPosition', { required: 'Job position is required' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Senior Software Engineer"
                />
                {errors.jobPosition && (
                  <p className="text-xs text-red-500 mt-1">{errors.jobPosition.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Duration & Compensation */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">Duration & Wage Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  End Date (Leave blank if open-ended)
                </label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Gross Monthly Wage ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="100"
                  {...register('wage', {
                    required: 'Wage is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Wage must be positive' },
                  })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                  placeholder="e.g. 7500"
                />
                {errors.wage && <p className="text-xs text-red-500 mt-1">{errors.wage.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Salary Structure
                </label>
                <input
                  type="text"
                  {...register('salaryStructure')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Software Engineer Standard Structure"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Working Schedule
                </label>
                <select
                  {...register('workingSchedule')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Standard 40h/week">Standard 40h/week (Mon-Fri)</option>
                  <option value="Flexible 35h/week">Flexible 35h/week</option>
                  <option value="Part-time 20h/week">Part-time 20h/week</option>
                  <option value="Shift Rotation 48h/week">Shift Rotation 48h/week</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Contract Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-semibold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Superseded">Superseded</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? 'Update Contract' : 'Create Contract'}
          </Button>
        </div>
      </form>
    </div>
  );
};
