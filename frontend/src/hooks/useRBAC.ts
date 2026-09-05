// RBAC Hook — Enforces Role-Based Access Control UI rules across all 5 roles:
// Admin, HR Manager, HR Payroll Manager, HR Payroll User, Employee
import { useAuth } from '../features/auth';
import type { UserRole } from '../types';

export function useRBAC() {
  const { user, role } = useAuth();

  const currentRole: UserRole = role || 'Employee';

  const isAdmin = currentRole === 'Admin';
  const isHRManager = currentRole === 'HR Manager';
  const isPayrollManager = currentRole === 'HR Payroll Manager';
  const isPayrollUser = currentRole === 'HR Payroll User';
  const isEmployee = currentRole === 'Employee';

  const isRole = (...roles: UserRole[]): boolean => {
    return roles.includes(currentRole);
  };

  /** Module Visibility Rules */
  const canAccessModule = (module: 'employees' | 'contracts' | 'attendance' | 'time-off' | 'payroll' | 'dashboard' | 'reports'): boolean => {
    if (isAdmin) return true;

    switch (module) {
      case 'employees':
        return isHRManager || isPayrollManager || isPayrollUser || isEmployee;
      case 'contracts':
        return isHRManager || isPayrollManager;
      case 'attendance':
        return true; // All roles
      case 'time-off':
        return true; // All roles
      case 'payroll':
        return isPayrollManager || isPayrollUser;
      case 'dashboard':
      case 'reports':
        return isHRManager || isPayrollManager || isPayrollUser;
      default:
        return false;
    }
  };

  /** Action Level Permissions */
  const canCreateEmployee = isAdmin || isHRManager;
  const canEditEmployee = isAdmin || isHRManager;
  const canCreateContract = isAdmin || isHRManager || isPayrollManager;
  const canComputePayrun = isAdmin || isPayrollManager || isPayrollUser;
  const canValidatePayrun = isAdmin || isPayrollManager;
  const canMarkPaid = isAdmin || isPayrollManager;
  const canSendPayslips = isAdmin || isPayrollManager;
  const canViewAttritionRisk = isAdmin || isHRManager || isPayrollManager;

  return {
    user,
    role: currentRole,
    isAdmin,
    isHRManager,
    isPayrollManager,
    isPayrollUser,
    isEmployee,
    isRole,
    canAccessModule,
    canCreateEmployee,
    canEditEmployee,
    canCreateContract,
    canComputePayrun,
    canValidatePayrun,
    canMarkPaid,
    canSendPayslips,
    canViewAttritionRisk,
  };
}
