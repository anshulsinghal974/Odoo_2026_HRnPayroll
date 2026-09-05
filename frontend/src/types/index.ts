// PeoplePay360 Shared Frontend Types

export type UserRole =
  | 'Employee'
  | 'HR Manager'
  | 'HR Payroll User'
  | 'HR Payroll Manager'
  | 'Admin';

export type Status = 'Active' | 'On Leave' | 'Terminated';

export type ContractStatus = 'Draft' | 'Active' | 'Superseded' | 'Expired';

export type PayrunStatus = 'Draft' | 'Computed' | 'Validated' | 'Paid';

export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Refused';

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}
