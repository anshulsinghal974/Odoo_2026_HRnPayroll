// Shared frontend TypeScript domain types

export type UserRole =
  | 'Employee'
  | 'HR Manager'
  | 'HR Payroll User'
  | 'HR Payroll Manager'
  | 'Admin';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';
export type ContractStatus = 'Draft' | 'Active' | 'Superseded' | 'Expired';
export type PayrunStatus = 'Draft' | 'Computed' | 'Validated' | 'Paid';
export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Refused';

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  sub: string;      // user id
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  iat: number;
  exp: number;
}

// Employee types
export interface Employee extends BaseEntity {
  name: string;
  department: string;
  manager?: string;
  managerId?: string;
  jobPosition: string;
  workingSchedule: string;
  status: EmployeeStatus;
  workEmail: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  avatarUrl?: string;
  // Smart counters
  contractsCount?: number;
  attendanceCount?: number;
  timeOffCount?: number;
  allocationsCount?: number;
}

export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;
