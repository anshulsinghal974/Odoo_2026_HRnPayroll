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

// Time Off types
export type TimeOffUnit = 'Days' | 'Hours';
export type TimeOffApprovalWorkflow = 'No Validation' | 'By Time Off Officer' | 'By HR Manager';

export interface TimeOffType extends BaseEntity {
  name: string;
  code: string;
  unit: TimeOffUnit;
  approvalWorkflow: TimeOffApprovalWorkflow;
  requiresAllocation: boolean;
  carryOverDays: number;
}

export type CreateTimeOffTypeInput = Omit<TimeOffType, 'id' | 'createdAt' | 'updatedAt'>;

export interface TimeOffAllocation extends BaseEntity {
  employeeId: string;
  employeeName: string;
  timeOffTypeId: string;
  timeOffTypeName: string;
  allocatedAmount: number;
  status: LeaveRequestStatus;
  validityStart: string;
  validityEnd: string;
  reason?: string;
}

export type CreateAllocationInput = Omit<TimeOffAllocation, 'id' | 'createdAt' | 'updatedAt'>;

export interface TimeOffRequest extends BaseEntity {
  employeeId: string;
  employeeName: string;
  timeOffTypeId: string;
  timeOffTypeName: string;
  startDate: string;
  endDate: string;
  duration: number;
  unit: TimeOffUnit;
  status: LeaveRequestStatus;
  reason?: string;
}

export type CreateTimeOffRequestInput = Omit<TimeOffRequest, 'id' | 'createdAt' | 'updatedAt'>;

export interface LeaveBalance {
  timeOffTypeId: string;
  timeOffTypeName: string;
  unit: TimeOffUnit;
  allocated: number;
  used: number;
  remaining: number;
}

// Payrun and Salary Structure types

export interface SalaryStructure extends BaseEntity {
  name: string;
  description?: string;
}

export type CreateSalaryStructureInput = Omit<SalaryStructure, 'id' | 'createdAt' | 'updatedAt'>;

export interface Payrun extends BaseEntity {
  salaryStructureId: string;
  periodStart: string;
  periodEnd: string;
  employeeIds: string[];
  status: PayrunStatus;
  totalAmount?: number;
  notes?: string;
}

export type CreatePayrunInput = Omit<Payrun, 'id' | 'createdAt' | 'updatedAt'>;

// Payslip types
export type PayslipCategory = 'Basic' | 'Allowances' | 'Gross' | 'Deductions' | 'Net';

export interface PayslipLine {
  id: string;
  code: string;
  name: string;
  category: PayslipCategory;
  amount: number;
}

export interface Payslip extends BaseEntity {
  payrunId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  department?: string;
  jobPosition?: string;
  periodStart: string;
  periodEnd: string;
  status: PayrunStatus | 'Sent';
  lines: PayslipLine[];
  basicTotal: number;
  allowancesTotal: number;
  grossTotal: number;
  deductionsTotal: number;
  netTotal: number;
}

// Dashboard types
export interface DashboardFilter {
  period: string;
  department: string;
  employeeType: string;
}

export interface DashboardKpi {
  totalNetSalary: number;
  payslipsGenerated: number;
  averageSalary: number;
  approvedTimeOffDays: number;
  totalNetSalaryChange: string;
  payslipsChange: string;
  avgSalaryChange: string;
  timeOffChange: string;
}

export interface DepartmentSalaryCost {
  department: string;
  basic: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export interface MonthlyNetSalaryTrend {
  month: string;
  grossSalary: number;
  netSalary: number;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  department?: string;
  timestamp: string;
}

export interface DashboardAggregationData {
  kpis: DashboardKpi;
  departmentCosts: DepartmentSalaryCost[];
  monthlyTrend: MonthlyNetSalaryTrend[];
  alerts: DashboardAlert[];
}

// ML & NLP Types
export interface AttendanceHealthScore {
  score: number; // 0 - 100
  status: 'Healthy' | 'Moderate' | 'Warning';
  onTimeRate: number; // percentage
  anomalyCount: number;
  summary: string;
}

export interface LeavePrediction {
  predictedDays: number;
  peakWindow: string;
  highRiskEmployeesCount: number;
  recommendation: string;
}

export interface SalaryForecastPoint {
  month: string;
  actual?: number;
  projected: number;
}

export interface NlpQueryResult {
  answer: string;
  confidence: number;
  suggestedActions?: string[];
}

export interface EmployeeAttritionRisk {
  employeeId: string;
  riskScore: number; // percentage
  riskLevel: 'Low' | 'Medium' | 'High';
  keyFactors: string[];
}



// Attendance types
export type AttendanceStatus = 'On Time' | 'Late' | 'Absent' | 'Overtime' | 'Missing Check-out';

export interface Attendance extends BaseEntity {
  employeeId: string;
  employeeName: string;
  checkIn: string; // ISO datetime
  checkOut?: string; // ISO datetime, optional for missing check-out
  workedHours?: number; // calculated, optional
  status: AttendanceStatus;
}

export interface AttendanceAudit {
  attendanceId: string;
  field: 'checkIn' | 'checkOut' | 'status';
  originalValue: string;
  newValue: string;
  correctedBy: string;
  correctedAt: string; // ISO datetime
}
