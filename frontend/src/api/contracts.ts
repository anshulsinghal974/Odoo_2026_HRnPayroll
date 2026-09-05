import { apiClient } from './client';
import type { Contract, CreateContractInput, UpdateContractInput } from '../types';

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'cnt-201',
    employeeId: 'emp-101',
    employeeName: 'Sarah Connor',
    department: 'Engineering',
    jobPosition: 'Lead Software Engineer',
    startDate: '2024-01-15',
    endDate: '2026-01-15',
    wage: 8500,
    salaryStructure: 'Software Engineer Standard (Gross + Benefits)',
    workingSchedule: 'Standard 40h/week',
    status: 'Active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cnt-202',
    employeeId: 'emp-102',
    employeeName: 'Alex Mercer',
    department: 'Engineering',
    jobPosition: 'VP of Engineering',
    startDate: '2023-06-01',
    wage: 12500,
    salaryStructure: 'Executive Leadership Structure',
    workingSchedule: 'Standard 40h/week',
    status: 'Active',
    createdAt: '2023-06-01T08:00:00Z',
  },
  {
    id: 'cnt-203',
    employeeId: 'emp-103',
    employeeName: 'Marcus Vance',
    department: 'Human Resources',
    jobPosition: 'HR Specialist',
    startDate: '2024-03-10',
    endDate: '2025-03-10',
    wage: 5200,
    salaryStructure: 'HR Support Base Structure',
    workingSchedule: 'Flexible 35h/week',
    status: 'Draft',
    createdAt: '2024-03-10T08:00:00Z',
  },
  {
    id: 'cnt-204',
    employeeId: 'emp-104',
    employeeName: 'David Kim',
    department: 'Finance & Payroll',
    jobPosition: 'Senior Payroll Manager',
    startDate: '2023-11-20',
    wage: 7800,
    salaryStructure: 'Finance Manager Structure',
    workingSchedule: 'Standard 40h/week',
    status: 'Active',
    createdAt: '2023-11-20T08:00:00Z',
  },
  {
    id: 'cnt-205',
    employeeId: 'emp-105',
    employeeName: 'Rachel Green',
    department: 'Marketing',
    jobPosition: 'Brand Designer',
    startDate: '2023-02-01',
    endDate: '2024-02-01',
    wage: 4500,
    salaryStructure: 'Standard Marketing Scale',
    workingSchedule: 'Standard 40h/week',
    status: 'Expired',
    createdAt: '2023-02-01T08:00:00Z',
  },
];

let localContractsStore = [...MOCK_CONTRACTS];

export async function getContracts(employeeId?: string): Promise<Contract[]> {
  try {
    const url = employeeId ? `/contracts?employeeId=${employeeId}` : '/contracts';
    const res = await apiClient.get<Contract[]>(url);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (employeeId) {
          resolve(localContractsStore.filter((c) => c.employeeId === employeeId));
        } else {
          resolve([...localContractsStore]);
        }
      }, 300);
    });
  }
}

export async function getContractById(id: string): Promise<Contract | undefined> {
  try {
    const res = await apiClient.get<Contract>(`/contracts/${id}`);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(localContractsStore.find((c) => c.id === id));
      }, 200);
    });
  }
}

export async function createContract(data: CreateContractInput): Promise<Contract> {
  try {
    const res = await apiClient.post<Contract>('/contracts', data);
    return res.data;
  } catch {
    const newContract: Contract = {
      ...data,
      id: `cnt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localContractsStore = [newContract, ...localContractsStore];
    return newContract;
  }
}

export async function updateContract(id: string, data: UpdateContractInput): Promise<Contract> {
  try {
    const res = await apiClient.put<Contract>(`/contracts/${id}`, data);
    return res.data;
  } catch {
    const idx = localContractsStore.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Contract not found');
    const updated = { ...localContractsStore[idx], ...data, updatedAt: new Date().toISOString() };
    localContractsStore[idx] = updated;
    return updated;
  }
}
