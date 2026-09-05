// Dashboard Aggregation API Client
import type { DashboardAggregationData, DashboardAlert, DashboardFilter } from '../types';
import { apiClient } from './client';

export async function getDashboardData(filter: DashboardFilter): Promise<DashboardAggregationData> {
  try {
    const res = await apiClient.get<DashboardAggregationData>('/dashboard/aggregate', {
      params: filter,
    });
    return res.data;
  } catch {
    // Client-side mock aggregation fallback
    return new Promise((resolve) => {
      setTimeout(() => {
        let mult = 1;
        if (filter.department === 'Engineering') mult = 0.55;
        else if (filter.department === 'Human Resources') mult = 0.2;
        else if (filter.department === 'Finance & Payroll') mult = 0.25;

        const totalNet = Math.round(28140 * mult);
        const payslipsCount = filter.department === 'All' ? 4 : 2;
        const avgSal = Math.round(totalNet / (payslipsCount || 1));
        const timeOff = filter.department === 'All' ? 14 : 4;

        const mockAlerts: DashboardAlert[] = [
          {
            id: 'alt-1',
            type: 'warning',
            title: 'Missing IBAN Account Number',
            description: '1 employee (Rachel Green) has a missing bank IBAN number. Payslip distribution will require manual review.',
            department: 'Marketing',
            timestamp: '2 hours ago',
          },
          {
            id: 'alt-2',
            type: 'danger',
            title: 'Pending High Wage Contract Approval',
            description: 'Executive salary structure amendment for Alex Mercer is pending HR Manager signature.',
            department: 'Engineering',
            timestamp: '5 hours ago',
          },
          {
            id: 'alt-3',
            type: 'info',
            title: 'Overtime Hours Flagged',
            description: '3 employees logged over 15 hours overtime in standard schedule period.',
            department: 'Engineering',
            timestamp: '1 day ago',
          },
        ];

        resolve({
          kpis: {
            totalNetSalary: totalNet,
            payslipsGenerated: payslipsCount,
            averageSalary: avgSal,
            approvedTimeOffDays: timeOff,
            totalNetSalaryChange: '+12.4% vs last period',
            payslipsChange: '+1 vs last period',
            avgSalaryChange: '+3.1%',
            timeOffChange: '-2 days vs last period',
          },
          departmentCosts: [
            {
              department: 'Engineering',
              basic: 10250,
              allowances: 10250,
              deductions: 3280,
              netSalary: 17220,
            },
            {
              department: 'Finance & Payroll',
              basic: 3750,
              allowances: 3750,
              deductions: 1200,
              netSalary: 6300,
            },
            {
              department: 'Human Resources',
              basic: 2750,
              allowances: 2750,
              deductions: 880,
              netSalary: 4620,
            },
            {
              department: 'Marketing',
              basic: 3250,
              allowances: 3250,
              deductions: 1040,
              netSalary: 5460,
            },
          ].filter(d => filter.department === 'All' || d.department === filter.department),
          monthlyTrend: [
            { month: 'Apr', grossSalary: 29000, netSalary: 24200 },
            { month: 'May', grossSalary: 31000, netSalary: 25800 },
            { month: 'Jun', grossSalary: 30500, netSalary: 25400 },
            { month: 'Jul', grossSalary: 32000, netSalary: 26900 },
            { month: 'Aug', grossSalary: 32500, netSalary: 27300 },
            { month: 'Sep', grossSalary: 33500, netSalary: totalNet || 28140 },
          ],
          alerts: mockAlerts.filter(a => filter.department === 'All' || !a.department || a.department === filter.department),
        });
      }, 200);
    });
  }
}
