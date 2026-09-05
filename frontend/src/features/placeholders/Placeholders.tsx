// Placeholder page factory — renders a coming-soon stub for unbuilt modules.
// Replace each export with the real page component as modules are built.

import { EmptyState } from '../../components';
import { Button } from '../../components';

interface PlaceholderProps {
  moduleName: string;
  icon: React.ReactNode;
  description?: string;
}

function PlaceholderPage({ moduleName, icon, description }: PlaceholderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{moduleName}</h1>
        <p className="text-sm text-neutral-500 mt-1">Module under construction · FE build in progress</p>
      </div>
      <EmptyState
        icon={icon}
        title={`${moduleName} Module`}
        description={description || `The ${moduleName} module will be built in a dedicated FE fraction. Wired to live API once BE endpoints land.`}
        action={<Button variant="outline" size="sm">Coming Soon</Button>}
      />
    </div>
  );
}

export function EmployeesPlaceholder() {
  return (
    <PlaceholderPage
      moduleName="Employees"
      description="Employee list (Kanban/List/Form views), status lifecycle, smart-button counters — built in FE-03."
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      }
    />
  );
}

export function ContractsPlaceholder() {
  return (
    <PlaceholderPage
      moduleName="Contracts"
      description="Contract history, status lifecycle (Active → Superseded), period-safe payroll resolution — built in FE-04."
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
    />
  );
}

export function AttendancePlaceholder() {
  return (
    <PlaceholderPage
      moduleName="Attendance"
      description="Check-in/out records, worked hours, manual corrections with audit trail — built in FE-05."
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    />
  );
}

export function TimeOffPlaceholder() {
  return (
    <PlaceholderPage
      moduleName="Time Off"
      description="Leave types, allocations, requests with approve/refuse and auto balance deduction — built in FE-06."
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
    />
  );
}

export function PayrollPlaceholder() {
  return (
    <PlaceholderPage
      moduleName="Payroll"
      description="Salary structures, salary rules, payrun wizard, payslips, PDF & bulk email — built in FE-07 / FE-08."
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    />
  );
}

export function ReportsPlaceholder() {
  return (
    <PlaceholderPage
      moduleName="Reports"
      description="Payroll dashboard KPIs, charts, ML widget: anomaly detection, forecasting, NLP assistant — built in FE-09 / FE-10."
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
    />
  );
}
