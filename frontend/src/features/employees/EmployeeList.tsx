import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Employee, EmployeeStatus, CreateEmployeeInput } from '../../types';
import { getEmployees, createEmployee, updateEmployee } from '../../api/employees';
import { EmployeeKanban } from './EmployeeKanban';
import { EmployeeForm } from './EmployeeForm';
import {
  Button,
  Card,
  Badge,
  Spinner,
  EmptyState,
} from '../../components';
import {
  Users,
  Plus,
  LayoutGrid,
  List,
  Search,
  Mail,
  Building2,
  Phone,
  Edit2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../auth';

export const EmployeeList: React.FC = () => {
  const { role } = useAuth();
  const isManagerRole = role === 'Admin' || role === 'HR Manager' || role === 'HR Payroll Manager';

  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // React Query setup for getEmployees
  const {
    data: employees = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsFormOpen(false);
      setSelectedEmployee(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmployeeInput> }) =>
      updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsFormOpen(false);
      setSelectedEmployee(null);
    },
  });

  // Filtered employees calculation
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.workEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.jobPosition.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department));
    return ['All', ...Array.from(set)];
  }, [employees]);

  const handleStatusChange = (id: string, newStatus: EmployeeStatus) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const handleFormSubmit = (data: CreateEmployeeInput) => {
    if (selectedEmployee) {
      updateMutation.mutate({ id: selectedEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isFormOpen) {
    return (
      <EmployeeForm
        initialValues={selectedEmployee || undefined}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false);
          setSelectedEmployee(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">Employees Directory</h1>
            {isFetching && <RefreshCw className="w-4 h-4 text-neutral-400 animate-spin" />}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage company workforce records, working schedules, and status
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-neutral-100 p-1 rounded-lg flex items-center border border-neutral-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>

          <Button
            onClick={() => {
              setSelectedEmployee(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Employee
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, email..."
              className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 bg-white font-medium focus:ring-1 focus:ring-primary-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 bg-white font-medium focus:ring-1 focus:ring-primary-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>Failed to load employees data. {(error as Error)?.message}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-8 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs font-medium text-neutral-500">Loading workforce directory...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No employees found"
          description="Try adjusting your search query or department filters to find matching employee records."
        />
      ) : viewMode === 'kanban' ? (
        <EmployeeKanban
          employees={filteredEmployees}
          onSelectEmployee={(emp) => {
            setSelectedEmployee(emp);
            setIsFormOpen(true);
          }}
          onStatusChange={handleStatusChange}
        />
      ) : (
        /* Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department & Role</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  {isManagerRole && <th className="px-4 py-3">Attrition Risk (ML)</th>}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setIsFormOpen(true);
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                          {emp.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 group-hover:text-primary-600">
                            {emp.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-mono">{emp.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-800">{emp.jobPosition}</p>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>{emp.department}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-neutral-600">
                      {emp.manager ? (
                        <span className="font-medium">{emp.manager}</span>
                      ) : (
                        <span className="text-neutral-400 italic">None</span>
                      )}
                    </td>

                    <td className="px-4 py-3 space-y-0.5 text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-neutral-400" />
                        <span className="truncate max-w-[180px]">{emp.workEmail}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          emp.status === 'Active'
                            ? 'success'
                            : emp.status === 'On Leave'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {emp.status}
                      </Badge>
                    </td>

                    {isManagerRole && (
                      <td className="px-4 py-3">
                        {emp.id === 'emp-105' ? (
                          <Badge variant="danger" size="sm" dot>
                            High (78%)
                          </Badge>
                        ) : emp.id === 'emp-103' ? (
                          <Badge variant="warning" size="sm" dot>
                            Medium (42%)
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Low (&lt;20%)
                          </Badge>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Edit Employee"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
