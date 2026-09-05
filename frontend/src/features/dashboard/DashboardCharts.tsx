import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '../../components';
import type { DepartmentSalaryCost, MonthlyNetSalaryTrend } from '../../types';

interface DashboardChartsProps {
  departmentCosts?: DepartmentSalaryCost[];
  monthlyTrend?: MonthlyNetSalaryTrend[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  departmentCosts = [],
  monthlyTrend = [],
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Salary Cost by Department (Bar Chart) */}
      <Card className="p-6 bg-white shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Salary Cost by Department</h3>
            <p className="text-xs text-neutral-500">Breakdown of gross earnings, deductions, and net pay per department</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-neutral-100 text-neutral-600 rounded">Bar Chart</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentCosts} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="basic" name="Basic" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="allowances" name="Allowances" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="netSalary" name="Net Salary" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Monthly Net Salary Trend (Line Chart) */}
      <Card className="p-6 bg-white shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Monthly Net Salary Trend</h3>
            <p className="text-xs text-neutral-500">Gross vs Net salary trajectory over recent payroll cycles</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-neutral-100 text-neutral-600 rounded">Line Chart</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="grossSalary" name="Gross Salary" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="netSalary" name="Net Salary" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
