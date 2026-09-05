import React from 'react';
import { Card, Button } from '../../components';
import type { DashboardFilter } from '../../types';

interface DashboardFilterBarProps {
  filter: DashboardFilter;
  onChange: (newFilter: DashboardFilter) => void;
  onReset: () => void;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  filter,
  onChange,
  onReset,
}) => {
  return (
    <Card className="p-4 bg-white shadow-sm border border-neutral-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-sm font-semibold text-neutral-800">Dashboard Analytics Filters</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Period Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-neutral-600">Period:</label>
            <select
              value={filter.period}
              onChange={(e) => onChange({ ...filter, period: e.target.value })}
              className="text-xs rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-neutral-800"
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-Q3">Q3 2026</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-neutral-600">Department:</label>
            <select
              value={filter.department}
              onChange={(e) => onChange({ ...filter, department: e.target.value })}
              className="text-xs rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-neutral-800"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Payroll">Finance & Payroll</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          {/* Employee Type Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-neutral-600">Employee Type:</label>
            <select
              value={filter.employeeType}
              onChange={(e) => onChange({ ...filter, employeeType: e.target.value })}
              className="text-xs rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-neutral-800"
            >
              <option value="All">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-neutral-500 hover:text-neutral-900">
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};
