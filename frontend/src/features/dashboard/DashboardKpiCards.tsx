import React from 'react';
import { Card } from '../../components';
import type { DashboardKpi } from '../../types';

interface DashboardKpiCardsProps {
  kpis?: DashboardKpi;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ kpis }) => {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Net Salary */}
      <Card className="p-5 bg-white shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Total Net Salary
          </span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-neutral-900 font-mono">
            ${kpis.totalNetSalary.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center text-xs font-medium text-emerald-600">
            <span>↑ {kpis.totalNetSalaryChange}</span>
          </div>
        </div>
      </Card>

      {/* 2. Payslips Generated */}
      <Card className="p-5 bg-white shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Payslips Generated
          </span>
          <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-neutral-900 font-mono">
            {kpis.payslipsGenerated}
          </div>
          <div className="mt-1 flex items-center text-xs font-medium text-primary-600">
            <span>↑ {kpis.payslipsChange}</span>
          </div>
        </div>
      </Card>

      {/* 3. Average Salary */}
      <Card className="p-5 bg-white shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Average Salary
          </span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-neutral-900 font-mono">
            ${kpis.averageSalary.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center text-xs font-medium text-amber-600">
            <span>↑ {kpis.avgSalaryChange}</span>
          </div>
        </div>
      </Card>

      {/* 4. Approved Time Off Days */}
      <Card className="p-5 bg-white shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Approved Time Off Days
          </span>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-neutral-900 font-mono">
            {kpis.approvedTimeOffDays} <span className="text-sm font-sans text-neutral-500 font-normal">days</span>
          </div>
          <div className="mt-1 flex items-center text-xs font-medium text-purple-600">
            <span>{kpis.timeOffChange}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
