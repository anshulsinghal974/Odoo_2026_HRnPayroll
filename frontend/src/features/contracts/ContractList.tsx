import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import type { Contract, CreateContractInput } from '../../types';
import { getContracts, createContract, updateContract } from '../../api/contracts';
import { ContractForm } from './ContractForm';
import {
  Button,
  Card,
  Badge,
  Spinner,
  EmptyState,
} from '../../components';
import {
  FileText,
  Plus,
  Search,
  Building2,
  Calendar,
  DollarSign,
  Edit2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const ContractList: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const employeeIdFilter = searchParams.get('employeeId');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // React Query for contracts list
  const {
    data: contracts = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['contracts', employeeIdFilter],
    queryFn: () => getContracts(employeeIdFilter || undefined),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsFormOpen(false);
      setSelectedContract(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateContractInput> }) =>
      updateContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsFormOpen(false);
      setSelectedContract(null);
    },
  });

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesSearch =
        c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.jobPosition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  const handleFormSubmit = (data: CreateContractInput) => {
    if (selectedContract) {
      updateMutation.mutate({ id: selectedContract.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isFormOpen) {
    return (
      <ContractForm
        initialValues={selectedContract || undefined}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false);
          setSelectedContract(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">Employment Contracts</h1>
            {isFetching && <RefreshCw className="w-4 h-4 text-neutral-400 animate-spin" />}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {employeeIdFilter
              ? `Filtered by employee ID: ${employeeIdFilter}`
              : 'Manage employee compensation, contracts, validity periods, and wage structures'}
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedContract(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Contract
        </Button>
      </div>

      {/* Search & Status Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contract ID, employee, position..."
              className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">Contract Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 bg-white font-medium focus:ring-1 focus:ring-primary-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Draft">Draft</option>
              <option value="Superseded">Superseded</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>Failed to fetch contracts data. {(error as Error)?.message}</span>
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
          <p className="text-xs font-medium text-neutral-500">Loading contracts registry...</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No contracts found"
          description="Create a new employment contract or clear search filters."
        />
      ) : (
        /* Table View — Highlighting Active Contracts */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Contract Ref</th>
                  <th className="px-4 py-3">Employee & Role</th>
                  <th className="px-4 py-3">Duration (Start – End)</th>
                  <th className="px-4 py-3">Gross Wage</th>
                  <th className="px-4 py-3">Salary Structure</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredContracts.map((cnt) => {
                  const isActive = cnt.status === 'Active';

                  return (
                    <tr
                      key={cnt.id}
                      onClick={() => {
                        setSelectedContract(cnt);
                        setIsFormOpen(true);
                      }}
                      className={`transition-colors cursor-pointer group ${
                        isActive
                          ? 'bg-emerald-50/50 hover:bg-emerald-50 border-l-4 border-l-emerald-500 font-medium'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-neutral-900">
                        <div className="flex items-center gap-1.5">
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span>{cnt.id}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-neutral-900 group-hover:text-primary-600">
                          {cnt.employeeName}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                          <Building2 className="w-3 h-3 text-neutral-400" />
                          <span>
                            {cnt.jobPosition} ({cnt.department})
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-neutral-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>
                            {cnt.startDate} → {cnt.endDate || 'Present'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-neutral-900 font-semibold">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>${cnt.wage.toLocaleString()}/mo</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-neutral-600 max-w-[200px] truncate">
                        {cnt.salaryStructure}
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            cnt.status === 'Active'
                              ? 'success'
                              : cnt.status === 'Draft'
                              ? 'primary'
                              : cnt.status === 'Superseded'
                              ? 'warning'
                              : 'danger'
                          }
                          dot={cnt.status === 'Active'}
                        >
                          {cnt.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedContract(cnt);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit Contract"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
