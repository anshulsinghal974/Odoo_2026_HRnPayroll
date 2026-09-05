// Mock Payrun API client
import type { SalaryStructure, Payrun } from '../types';
import { apiClient } from './client'; // placeholder for real client; not used for mock

// Mock data
let salaryStructures: SalaryStructure[] = [
  { id: 'ss1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), name: 'Standard Salary', description: 'Base salary structure' },
  { id: 'ss2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), name: 'Executive', description: 'Higher compensation' },
];

let payruns: Payrun[] = [];

/** Fetch available salary structures */
export const getSalaryStructures = async (): Promise<SalaryStructure[]> => {
  await new Promise((r) => setTimeout(r, 150));
  return [...salaryStructures];
};

/** Create a new payrun (mock) */
export const createPayrun = async (payload: Omit<Payrun, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payrun> => {
  await new Promise((r) => setTimeout(r, 200));
  const newPayrun: Payrun = {
    id: `pr${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload,
    status: 'Draft',
  };
  payruns.push(newPayrun);
  return newPayrun;
};

/** Get a payrun by ID */
export const getPayrun = async (id: string): Promise<Payrun | undefined> => {
  await new Promise((r) => setTimeout(r, 100));
  return payruns.find((p) => p.id === id);
};
