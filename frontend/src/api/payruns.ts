// Mock Payrun API client
import type { SalaryStructure, Payrun } from '../types';
// apiClient reserved for real backend integration

// Mock data
let salaryStructures: SalaryStructure[] = [
  { id: 'ss1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), name: 'Standard Salary', description: 'Base salary structure' },
  { id: 'ss2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), name: 'Executive', description: 'Higher compensation' },
];

let payruns: Payrun[] = [];

/** Get salary structures */
export const getSalaryStructures = async (): Promise<SalaryStructure[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...salaryStructures]), 150));
};

/** Get a payrun by ID */
export const getPayrun = async (id: string): Promise<Payrun | undefined> => {
  return new Promise((resolve) => setTimeout(() => resolve(payruns.find(p => p.id === id)), 150));
};

/** Create a new payrun */
export const createPayrun = async (data: {
  salaryStructureId: string;
  periodStart: string;
  periodEnd: string;
  employeeIds: string[];
}): Promise<Payrun> => {
  const newPayrun: Payrun = {
    id: `pr-${Date.now()}`,
    salaryStructureId: data.salaryStructureId,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    employeeIds: data.employeeIds,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Payrun;
  payruns.push(newPayrun);
  return new Promise((resolve) => setTimeout(() => resolve(newPayrun), 150));
};

/** Compute payrun */
export const computePayrun = async (id: string): Promise<Payrun> => {
  await new Promise(r => setTimeout(r, 150));
  const p = payruns.find(p => p.id === id);
  if (p) p.status = 'Computed';
  return p as Payrun;
};

export const validatePayrun = async (id: string): Promise<Payrun> => {
  await new Promise(r => setTimeout(r, 150));
  const p = payruns.find(p => p.id === id);
  if (p) p.status = 'Validated';
  return p as Payrun;
};

export const markPayrunPaid = async (id: string): Promise<Payrun> => {
  await new Promise(r => setTimeout(r, 150));
  const p = payruns.find(p => p.id === id);
  if (p) p.status = 'Paid';
  return p as Payrun;
};

export const sendPayrun = async (_id: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 150));
  // placeholder for sending logic
  return;
};
