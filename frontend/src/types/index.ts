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

// Contract types
export interface Contract extends BaseEntity {
  employeeId: string;
  employeeName: string;
  department: string;
  jobPosition: string;
  startDate: string;
  endDate?: string;
  wage: number; // Monthly gross base salary
  salaryStructure: string;
  workingSchedule: string;
  status: ContractStatus;
}

export type CreateContractInput = Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateContractInput = Partial<CreateContractInput>;

// Working Schedule types
export interface ScheduleDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isWorkDay: boolean;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  breakHours: number; // e.g. 1.0
  dailyHours: number; // e.g. 7.0 (calculated)
}

export interface WorkingSchedule extends BaseEntity {
  name: string;
  days: ScheduleDay[];
  totalWeeklyHours: number;
}

export type CreateScheduleInput = Omit<WorkingSchedule, 'id' | 'createdAt' | 'updatedAt'>;
