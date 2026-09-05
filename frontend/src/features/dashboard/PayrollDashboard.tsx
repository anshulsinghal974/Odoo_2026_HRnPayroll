// Main Payroll Dashboard Page
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spinner, Alert } from '../../components';
import { getDashboardData } from '../../api/dashboard';
import { DashboardFilterBar } from './DashboardFilterBar';
import { DashboardKpiCards } from './DashboardKpiCards';
import { DashboardCharts } from './DashboardCharts';
import { DashboardAlertsPanel } from './DashboardAlertsPanel';
import { MlDashboardWidgets } from './MlDashboardWidgets';
import type { DashboardFilter } from '../../types';

const initialFilter: DashboardFilter = {
  period: '2026-09',
  department: 'All',
  employeeType: 'All',
};

export const PayrollDashboard: React.FC = () => {
  const [filter, setFilter] = useState<DashboardFilter>(initialFilter);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', filter],
    queryFn: () => getDashboardData(filter),
  });

  const handleReset = () => {
    setFilter(initialFilter);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Payroll Analytics Dashboard</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time salary costs, department budget breakdown, net trends, and operational warnings
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          🔄 Refresh Analytics
        </button>
      </div>

      {/* 1. Filter Bar (Period, Department, Employee Type) */}
      <DashboardFilterBar
        filter={filter}
        onChange={(newFilter) => setFilter(newFilter)}
        onReset={handleReset}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" label="Aggregating payroll dashboard metrics..." />
        </div>
      ) : isError || !data ? (
        <Alert type="error" message="Failed to load dashboard aggregation data." />
      ) : (
        <>
          {/* 2. KPI Cards (Total Net Salary, Payslips Generated, Avg Salary, Approved Time Off Days) */}
          <DashboardKpiCards kpis={data.kpis} />

          {/* 3. ML-Powered Widgets (Attendance Health, Leave Prediction, Salary Forecast) */}
          <MlDashboardWidgets />

          {/* 4. Charts (Salary Cost by Department BarChart & Monthly Net Salary Trend LineChart) */}
          <DashboardCharts
            departmentCosts={data.departmentCosts}
            monthlyTrend={data.monthlyTrend}
          />

          {/* 4. System Warnings & Raw Alerts Panel */}
          <DashboardAlertsPanel alerts={data.alerts} />
        </>
      )}
    </div>
  );
};
