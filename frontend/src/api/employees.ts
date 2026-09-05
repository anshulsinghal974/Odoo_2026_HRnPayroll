import { apiClient } from './client';
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    name: 'Sarah Connor',
    department: 'Engineering',
    manager: 'Alex Mercer',
    jobPosition: 'Lead Software Engineer',
    workingSchedule: 'Standard 40h/week',
    status: 'Active',
    workEmail: 'sarah.connor@peoplepay.io',
    phone: '+1 (555) 234-5678',
    bankName: 'Silicon Valley Bank',
    accountNumber: '•••• 4892',
    contractsCount: 2,
    attendanceCount: 18,
    timeOffCount: 3,
    allocationsCount: 1,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'emp-102',
    name: 'Alex Mercer',
    department: 'Engineering',
    manager: 'Elena Rostova',
    jobPosition: 'VP of Engineering',
    workingSchedule: 'Standard 40h/week',
    status: 'Active',
    workEmail: 'alex.mercer@peoplepay.io',
    phone: '+1 (555) 876-5432',
    bankName: 'Chase Bank',
    accountNumber: '•••• 1104',
    contractsCount: 3,
    attendanceCount: 22,
    timeOffCount: 0,
    allocationsCount: 2,
    createdAt: '2023-06-01T08:00:00Z',
  },
  {
    id: 'emp-103',
    name: 'Marcus Vance',
    department: 'Human Resources',
    manager: 'Elena Rostova',
    jobPosition: 'HR Specialist',
    workingSchedule: 'Flexible 35h/week',
    status: 'On Leave',
    workEmail: 'marcus.vance@peoplepay.io',
    phone: '+1 (555) 345-6789',
    bankName: 'Bank of America',
    accountNumber: '•••• 9923',
    contractsCount: 1,
    attendanceCount: 12,
    timeOffCount: 5,
    allocationsCount: 1,
    createdAt: '2024-03-10T08:00:00Z',
  },
  {
    id: 'emp-104',
    name: 'David Kim',
    department: 'Finance & Payroll',
    manager: 'Elena Rostova',
    jobPosition: 'Senior Payroll Manager',
    workingSchedule: 'Standard 40h/week',
    status: 'Active',
    workEmail: 'david.kim@peoplepay.io',
    phone: '+1 (555) 654-9870',
    bankName: 'Wells Fargo',
    accountNumber: '•••• 3321',
    contractsCount: 2,
    attendanceCount: 20,
    timeOffCount: 1,
    allocationsCount: 2,
    createdAt: '2023-11-20T08:00:00Z',
  },
  {
    id: 'emp-105',
    name: 'Rachel Green',
    department: 'Marketing',
    manager: 'Alex Mercer',
    jobPosition: 'Brand Designer',
    workingSchedule: 'Standard 40h/week',
    status: 'Terminated',
    workEmail: 'rachel.green@peoplepay.io',
    phone: '+1 (555) 444-2211',
    bankName: 'Citibank',
    accountNumber: '•••• 7765',
    contractsCount: 1,
    attendanceCount: 0,
    timeOffCount: 10,
    allocationsCount: 0,
    createdAt: '2023-02-01T08:00:00Z',
  },
];

let localEmployeesStore = [...MOCK_EMPLOYEES];

export async function getEmployees(): Promise<Employee[]> {
  try {
    const res = await apiClient.get<Employee[]>('/employees');
    return res.data;
  } catch {
    // Fallback to local store for offline/mock development
    return new Promise((resolve) => {
      setTimeout(() => resolve([...localEmployeesStore]), 300);
    });
  }
}

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  try {
    const res = await apiClient.get<Employee>(`/employees/${id}`);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = localEmployeesStore.find((e) => e.id === id);
        resolve(found);
      }, 200);
    });
  }
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee> {
  try {
    const res = await apiClient.post<Employee>('/employees', data);
    return res.data;
  } catch {
    const newEmp: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
      contractsCount: 1,
      attendanceCount: 0,
      timeOffCount: 0,
      allocationsCount: 1,
      createdAt: new Date().toISOString(),
    };
    localEmployeesStore = [newEmp, ...localEmployeesStore];
    return newEmp;
  }
}

export async function updateEmployee(id: string, data: UpdateEmployeeInput): Promise<Employee> {
  try {
    const res = await apiClient.put<Employee>(`/employees/${id}`, data);
    return res.data;
  } catch {
    const idx = localEmployeesStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    const updated = { ...localEmployeesStore[idx], ...data, updatedAt: new Date().toISOString() };
    localEmployeesStore[idx] = updated;
    return updated;
  }
}
