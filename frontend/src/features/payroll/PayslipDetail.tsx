// PayslipDetail UI Component — Computation Table grouped into Basic/Allowances/Gross/Deductions/Net
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert } from '../../components';
import { getPayslip, printPayslipPdf } from '../../api/payslips';
import type { PayslipCategory, PayslipLine } from '../../types';

const CATEGORY_ORDER: PayslipCategory[] = ['Basic', 'Allowances', 'Gross', 'Deductions', 'Net'];

const CATEGORY_BADGES: Record<PayslipCategory, { variant: 'primary' | 'neutral' | 'success' | 'warning' | 'danger'; bg: string }> = {
  Basic: { variant: 'neutral', bg: 'bg-neutral-50 border-neutral-200' },
  Allowances: { variant: 'primary', bg: 'bg-primary-50/50 border-primary-100' },
  Gross: { variant: 'warning', bg: 'bg-amber-50/60 border-amber-200' },
  Deductions: { variant: 'danger', bg: 'bg-rose-50/60 border-rose-200' },
  Net: { variant: 'success', bg: 'bg-emerald-50 border-emerald-200' },
};

export const PayslipDetail: React.FC = () => {
  const { payslipId } = useParams<{ payslipId: string }>();
  const navigate = useNavigate();

  const {
    data: payslip,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['payslip', payslipId],
    queryFn: () => getPayslip(payslipId!),
    enabled: !!payslipId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" label="Loading payslip details..." />
      </div>
    );
  }

  if (isError || !payslip) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert type="error" message="Unable to load payslip computation details." />
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            ← Back to Payroll
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    printPayslipPdf(payslip.id);
  };

  // Group lines by Category
  const linesByCategory: Record<PayslipCategory, PayslipLine[]> = {
    Basic: [],
    Allowances: [],
    Gross: [],
    Deductions: [],
    Net: [],
  };

  payslip.lines.forEach((line) => {
    if (linesByCategory[line.category]) {
      linesByCategory[line.category].push(line);
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Navigation & Actions Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ← Back to Processing
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            🖨️ Print Payslip
          </Button>
        </div>
      </div>

      {/* Main Header Card */}
      <Card className="p-6 bg-white shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">{payslip.employeeName}</h1>
              <Badge variant={payslip.status === 'Sent' ? 'success' : 'primary'} size="sm">
                {payslip.status}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              {payslip.jobPosition || 'Employee'} • {payslip.department || 'General'}
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">Payslip Ref</span>
            <span className="text-sm font-mono font-medium text-neutral-800">{payslip.id}</span>
            <span className="text-xs text-neutral-500 block mt-0.5">
              Period: {payslip.periodStart} to {payslip.periodEnd}
            </span>
          </div>
        </div>

        {/* High-level Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
            <span className="text-xs text-neutral-500 font-medium block">Basic</span>
            <span className="text-base font-semibold text-neutral-800">${payslip.basicTotal.toLocaleString()}</span>
          </div>
          <div className="bg-primary-50/40 p-3 rounded-lg border border-primary-100/60">
            <span className="text-xs text-primary-600 font-medium block">Allowances</span>
            <span className="text-base font-semibold text-primary-900">${payslip.allowancesTotal.toLocaleString()}</span>
          </div>
          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
            <span className="text-xs text-amber-700 font-medium block">Gross Earnings</span>
            <span className="text-base font-semibold text-amber-900">${payslip.grossTotal.toLocaleString()}</span>
          </div>
          <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100">
            <span className="text-xs text-rose-700 font-medium block">Deductions</span>
            <span className="text-base font-semibold text-rose-900">-${payslip.deductionsTotal.toLocaleString()}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-xs text-emerald-700 font-semibold block">Net Payable</span>
            <span className="text-lg font-bold text-emerald-900">${payslip.netTotal.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Computation Table Grouped by Category */}
      <Card className="p-6 bg-white shadow-sm border border-neutral-200 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Computation Details</h2>
          <p className="text-xs text-neutral-500">Breakdown of salary calculation rules and component amounts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-32">Code</th>
                <th className="py-3 px-4">Component Name</th>
                <th className="py-3 px-4 w-36">Category</th>
                <th className="py-3 px-4 text-right w-40">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {CATEGORY_ORDER.map((category) => {
                const categoryLines = linesByCategory[category];
                if (!categoryLines || categoryLines.length === 0) return null;

                const categoryTotal = categoryLines.reduce((acc, l) => acc + l.amount, 0);
                const badgeConfig = CATEGORY_BADGES[category];

                return (
                  <React.Fragment key={category}>
                    {/* Category Group Header */}
                    <tr className={`${badgeConfig.bg} border-t-2 border-b border-neutral-200`}>
                      <td colSpan={3} className="py-2.5 px-4 font-bold text-neutral-800">
                        <div className="flex items-center gap-2">
                          <Badge variant={badgeConfig.variant} size="sm">
                            {category}
                          </Badge>
                          <span className="text-xs text-neutral-500 font-normal">
                            ({categoryLines.length} {categoryLines.length === 1 ? 'item' : 'items'})
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-neutral-900 font-mono">
                        ${categoryTotal.toLocaleString()}
                      </td>
                    </tr>

                    {/* Category Items */}
                    {categoryLines.map((line) => (
                      <tr key={line.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-xs font-semibold text-neutral-600">
                          {line.code}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-neutral-900">
                          {line.name}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-neutral-500">
                          {line.category}
                        </td>
                        <td
                          className={`py-2.5 px-4 text-right font-mono font-medium ${
                            category === 'Deductions' ? 'text-rose-600' : 'text-neutral-900'
                          }`}
                        >
                          {category === 'Deductions' ? `-$${line.amount.toLocaleString()}` : `$${line.amount.toLocaleString()}`}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-900 bg-neutral-900 text-white font-bold">
                <td colSpan={3} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs">
                  Net Salary Payable Total:
                </td>
                <td className="py-3.5 px-4 text-right text-base font-mono text-emerald-400">
                  ${payslip.netTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};
