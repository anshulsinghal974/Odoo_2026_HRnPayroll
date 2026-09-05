import { apiClient } from './client';
import type {
  TimeOffType,
  CreateTimeOffTypeInput,
  TimeOffAllocation,
  CreateAllocationInput,
  TimeOffRequest,
  CreateTimeOffRequestInput,
  LeaveBalance,
  LeaveRequestStatus,
} from '../types';

export const MOCK_TIMEOFF_TYPES: TimeOffType[] = [
  {
    id: 'tot-1',
    name: 'Paid Annual Leave',
    code: 'PAID',
    unit: 'Days',
    approvalWorkflow: 'By HR Manager',
    requiresAllocation: true,
    carryOverDays: 5,
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'tot-2',
    name: 'Sick Leave',
    code: 'SICK',
    unit: 'Days',
    approvalWorkflow: 'By Time Off Officer',
    requiresAllocation: false,
    carryOverDays: 0,
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'tot-3',
    name: 'Unpaid Leave',
    code: 'UNPAID',
    unit: 'Days',
    approvalWorkflow: 'By HR Manager',
    requiresAllocation: false,
    carryOverDays: 0,
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'tot-4',
    name: 'Hourly Doctor Visit',
    code: 'DOC_HR',
    unit: 'Hours',
    approvalWorkflow: 'No Validation',
    requiresAllocation: true,
    carryOverDays: 0,
    createdAt: '2024-01-01T08:00:00Z',
  },
];

export const MOCK_ALLOCATIONS: TimeOffAllocation[] = [
  {
    id: 'alloc-501',
    employeeId: 'emp-101',
    employeeName: 'Sarah Connor',
    timeOffTypeId: 'tot-1',
    timeOffTypeName: 'Paid Annual Leave',
    allocatedAmount: 25,
    status: 'Approved',
    validityStart: '2026-01-01',
    validityEnd: '2026-12-31',
    reason: 'Annual contract allocation 2026',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'alloc-502',
    employeeId: 'emp-102',
    employeeName: 'Alex Mercer',
    timeOffTypeId: 'tot-1',
    timeOffTypeName: 'Paid Annual Leave',
    allocatedAmount: 30,
    status: 'Approved',
    validityStart: '2026-01-01',
    validityEnd: '2026-12-31',
    reason: 'Executive 30-day allocation',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'alloc-503',
    employeeId: 'emp-103',
    employeeName: 'Marcus Vance',
    timeOffTypeId: 'tot-1',
    timeOffTypeName: 'Paid Annual Leave',
    allocatedAmount: 20,
    status: 'Pending',
    validityStart: '2026-01-01',
    validityEnd: '2026-12-31',
    reason: 'New employee allocation request',
    createdAt: '2026-02-15T08:00:00Z',
  },
];

export const MOCK_REQUESTS: TimeOffRequest[] = [
  {
    id: 'req-601',
    employeeId: 'emp-101',
    employeeName: 'Sarah Connor',
    timeOffTypeId: 'tot-1',
    timeOffTypeName: 'Paid Annual Leave',
    startDate: '2026-07-10',
    endDate: '2026-07-15',
    duration: 5,
    unit: 'Days',
    status: 'Approved',
    reason: 'Summer vacation trip',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'req-602',
    employeeId: 'emp-101',
    employeeName: 'Sarah Connor',
    timeOffTypeId: 'tot-2',
    timeOffTypeName: 'Sick Leave',
    startDate: '2026-03-02',
    endDate: '2026-03-03',
    duration: 2,
    unit: 'Days',
    status: 'Approved',
    reason: 'Flu treatment',
    createdAt: '2026-03-02T08:00:00Z',
  },
  {
    id: 'req-603',
    employeeId: 'emp-103',
    employeeName: 'Marcus Vance',
    timeOffTypeId: 'tot-1',
    timeOffTypeName: 'Paid Annual Leave',
    startDate: '2026-09-12',
    endDate: '2026-09-18',
    duration: 5,
    unit: 'Days',
    status: 'Pending',
    reason: 'Family event',
    createdAt: '2026-09-01T08:00:00Z',
  },
];

let localTypesStore = [...MOCK_TIMEOFF_TYPES];
let localAllocationsStore = [...MOCK_ALLOCATIONS];
let localRequestsStore = [...MOCK_REQUESTS];

// ── Time Off Types API ──────────────────────────────────────────────────────────
export async function getTimeOffTypes(): Promise<TimeOffType[]> {
  try {
    const res = await apiClient.get<TimeOffType[]>('/timeoff/types');
    return res.data;
  } catch {
    return new Promise((resolve) => setTimeout(() => resolve([...localTypesStore]), 200));
  }
}

export async function createTimeOffType(data: CreateTimeOffTypeInput): Promise<TimeOffType> {
  try {
    const res = await apiClient.post<TimeOffType>('/timeoff/types', data);
    return res.data;
  } catch {
    const newType: TimeOffType = {
      ...data,
      id: `tot-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localTypesStore = [newType, ...localTypesStore];
    return newType;
  }
}

// ── Allocations API ─────────────────────────────────────────────────────────────
export async function getAllocations(employeeId?: string): Promise<TimeOffAllocation[]> {
  try {
    const url = employeeId ? `/timeoff/allocations?employeeId=${employeeId}` : '/timeoff/allocations';
    const res = await apiClient.get<TimeOffAllocation[]>(url);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (employeeId) {
          resolve(localAllocationsStore.filter((a) => a.employeeId === employeeId));
        } else {
          resolve([...localAllocationsStore]);
        }
      }, 200);
    });
  }
}

export async function createAllocation(data: CreateAllocationInput): Promise<TimeOffAllocation> {
  try {
    const res = await apiClient.post<TimeOffAllocation>('/timeoff/allocations', data);
    return res.data;
  } catch {
    const newAlloc: TimeOffAllocation = {
      ...data,
      id: `alloc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localAllocationsStore = [newAlloc, ...localAllocationsStore];
    return newAlloc;
  }
}

export async function updateAllocationStatus(
  id: string,
  status: LeaveRequestStatus
): Promise<TimeOffAllocation> {
  try {
    const res = await apiClient.patch<TimeOffAllocation>(`/timeoff/allocations/${id}`, { status });
    return res.data;
  } catch {
    const idx = localAllocationsStore.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Allocation not found');
    localAllocationsStore[idx] = { ...localAllocationsStore[idx], status };
    return localAllocationsStore[idx];
  }
}

// ── Requests API ────────────────────────────────────────────────────────────────
export async function getTimeOffRequests(employeeId?: string): Promise<TimeOffRequest[]> {
  try {
    const url = employeeId ? `/timeoff/requests?employeeId=${employeeId}` : '/timeoff/requests';
    const res = await apiClient.get<TimeOffRequest[]>(url);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (employeeId) {
          resolve(localRequestsStore.filter((r) => r.employeeId === employeeId));
        } else {
          resolve([...localRequestsStore]);
        }
      }, 200);
    });
  }
}

export async function createTimeOffRequest(data: CreateTimeOffRequestInput): Promise<TimeOffRequest> {
  try {
    const res = await apiClient.post<TimeOffRequest>('/timeoff/requests', data);
    return res.data;
  } catch {
    const newReq: TimeOffRequest = {
      ...data,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localRequestsStore = [newReq, ...localRequestsStore];
    return newReq;
  }
}

export async function updateRequestStatus(
  id: string,
  status: LeaveRequestStatus
): Promise<TimeOffRequest> {
  try {
    const res = await apiClient.patch<TimeOffRequest>(`/timeoff/requests/${id}`, { status });
    return res.data;
  } catch {
    const idx = localRequestsStore.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Request not found');
    localRequestsStore[idx] = { ...localRequestsStore[idx], status };
    return localRequestsStore[idx];
  }
}

// ── Balances Calculator ─────────────────────────────────────────────────────────
export async function getLeaveBalances(employeeId: string = 'emp-101'): Promise<LeaveBalance[]> {
  const allocations = await getAllocations(employeeId);
  const requests = await getTimeOffRequests(employeeId);
  const types = await getTimeOffTypes();

  return types.map((t) => {
    const allocated = allocations
      .filter((a) => a.timeOffTypeId === t.id && a.status === 'Approved')
      .reduce((sum, a) => sum + a.allocatedAmount, 0);

    const used = requests
      .filter((r) => r.timeOffTypeId === t.id && r.status === 'Approved')
      .reduce((sum, r) => sum + r.duration, 0);

    return {
      timeOffTypeId: t.id,
      timeOffTypeName: t.name,
      unit: t.unit,
      allocated: t.requiresAllocation ? allocated : 30, // Unrestricted default if no allocation required
      used,
      remaining: Math.max(0, (t.requiresAllocation ? allocated : 30) - used),
    };
  });
}
