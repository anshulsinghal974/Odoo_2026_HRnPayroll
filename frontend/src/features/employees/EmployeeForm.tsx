import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { Employee, CreateEmployeeInput, EmployeeStatus } from '../../types';
import { Button, Card, CardContent, CardHeader } from '../../components';
import { FileText, Calendar, Clock, Award, ArrowLeft, Save } from 'lucide-react';

interface EmployeeFormProps {
  initialValues?: Employee;
  onSubmit: (data: CreateEmployeeInput) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

interface FormFields {
  name: string;
  department: string;
  manager: string;
  jobPosition: string;
  workingSchedule: string;
  status: EmployeeStatus;
  workEmail: string;
  phone: string;
  bankName: string;
  accountNumber: string;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      name: initialValues?.name || '',
      department: initialValues?.department || 'Engineering',
      manager: initialValues?.manager || '',
      jobPosition: initialValues?.jobPosition || '',
      workingSchedule: initialValues?.workingSchedule || 'Standard 40h/week',
      status: initialValues?.status || 'Active',
      workEmail: initialValues?.workEmail || '',
      phone: initialValues?.phone || '',
      bankName: initialValues?.bankName || '',
      accountNumber: initialValues?.accountNumber || '',
    },
  });

  const isEditMode = Boolean(initialValues?.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Smart Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {isEditMode ? initialValues?.name : 'Create New Employee'}
            </h1>
            <p className="text-xs text-neutral-500">
              {isEditMode ? `ID: ${initialValues?.id}` : 'Fill in employee details per company registry'}
            </p>
          </div>
        </div>

        {/* Smart Counter Buttons (F4 Feature) */}
        {isEditMode && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/contracts?employeeId=${initialValues?.id}`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:border-primary-300"
            >
              <FileText className="w-4 h-4 text-primary-600" />
              <span>Contracts</span>
              <span className="bg-primary-100 text-primary-700 font-bold px-1.5 py-0.5 rounded-full text-[11px]">
                {initialValues?.contractsCount ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/attendance?employeeId=${initialValues?.id}`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:border-emerald-300"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Attendance</span>
              <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full text-[11px]">
                {initialValues?.attendanceCount ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/time-off?employeeId=${initialValues?.id}`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:border-amber-300"
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Time Off</span>
              <span className="bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full text-[11px]">
                {initialValues?.timeOffCount ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/payroll?employeeId=${initialValues?.id}`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:border-indigo-300"
            >
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Allocations</span>
              <span className="bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full text-[11px]">
                {initialValues?.allocationsCount ?? 0}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Form Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">Work & Identity Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Full name is required' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Sarah Connor"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('workEmail', {
                    required: 'Work email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                  })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. sarah.connor@peoplepay.io"
                />
                {errors.workEmail && (
                  <p className="text-xs text-red-500 mt-1">{errors.workEmail.message}</p>
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
                  <option value="Operations">Operations</option>
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

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Manager</label>
                <input
                  type="text"
                  {...register('manager')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Alex Mercer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">Schedule & Contact Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Working Schedule</label>
                <select
                  {...register('workingSchedule')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Standard 40h/week">Standard 40h/week</option>
                  <option value="Flexible 35h/week">Flexible 35h/week</option>
                  <option value="Part-time 20h/week">Part-time 20h/week</option>
                  <option value="Shift Rotation 48h/week">Shift Rotation 48h/week</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">Bank & Payment Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  {...register('bankName')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Chase Bank"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Account Number / IBAN</label>
                <input
                  type="text"
                  {...register('accountNumber')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. •••• 4892"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? 'Save Changes' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
};
