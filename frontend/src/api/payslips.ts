// Payslip API Client & Mock Generator
import type { Payslip, PayslipLine } from '../types';
import { apiClient } from './client';
import { MOCK_EMPLOYEES } from './employees';

const createDefaultLines = (wage: number = 5000): PayslipLine[] => {
  const basic = Math.round(wage * 0.5);
  const hra = Math.round(wage * 0.25);
  const flexi = Math.round(wage * 0.25);
  const gross = basic + hra + flexi;

  const pf = Math.round(basic * 0.12);
  const tax = Math.round(gross * 0.10);
  const totalDeductions = pf + tax;

  const net = gross - totalDeductions;

  return [
    { id: 'l-1', code: 'BASIC', name: 'Basic Salary', category: 'Basic', amount: basic },
    { id: 'l-2', code: 'HRA', name: 'House Rent Allowance', category: 'Allowances', amount: hra },
    { id: 'l-3', code: 'FLEXI', name: 'Flexible Benefit Allowance', category: 'Allowances', amount: flexi },
    { id: 'l-4', code: 'GROSS', name: 'Gross Earnings', category: 'Gross', amount: gross },
    { id: 'l-5', code: 'PF', name: 'Provident Fund Deduction', category: 'Deductions', amount: pf },
    { id: 'l-6', code: 'TAX', name: 'Income Tax (TDS)', category: 'Deductions', amount: tax },
    { id: 'l-7', code: 'NET', name: 'Net Salary Pay', category: 'Net', amount: net },
  ];
};

let mockPayslipsStore: Payslip[] = [
  {
    id: 'ps-101',
    payrunId: 'pr-demo',
    employeeId: 'emp-101',
    employeeName: 'Sarah Connor',
    employeeEmail: 'sarah.connor@peoplepay.io',
    department: 'Engineering',
    jobPosition: 'Lead Software Engineer',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    status: 'Validated',
    lines: createDefaultLines(8500),
    basicTotal: 4250,
    allowancesTotal: 4250,
    grossTotal: 8500,
    deductionsTotal: 1360,
    netTotal: 7140,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ps-102',
    payrunId: 'pr-demo',
    employeeId: 'emp-102',
    employeeName: 'Alex Mercer',
    employeeEmail: 'alex.mercer@peoplepay.io',
    department: 'Engineering',
    jobPosition: 'VP of Engineering',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    status: 'Validated',
    lines: createDefaultLines(12000),
    basicTotal: 6000,
    allowancesTotal: 6000,
    grossTotal: 12000,
    deductionsTotal: 1920,
    netTotal: 10080,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ps-103',
    payrunId: 'pr-demo',
    employeeId: 'emp-103',
    employeeName: 'Marcus Vance',
    employeeEmail: 'marcus.vance@peoplepay.io',
    department: 'Human Resources',
    jobPosition: 'HR Specialist',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    status: 'Validated',
    lines: createDefaultLines(5500),
    basicTotal: 2750,
    allowancesTotal: 2750,
    grossTotal: 5500,
    deductionsTotal: 880,
    netTotal: 4620,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ps-104',
    payrunId: 'pr-demo',
    employeeId: 'emp-104',
    employeeName: 'David Kim',
    employeeEmail: 'david.kim@peoplepay.io',
    department: 'Finance & Payroll',
    jobPosition: 'Senior Payroll Manager',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    status: 'Validated',
    lines: createDefaultLines(7500),
    basicTotal: 3750,
    allowancesTotal: 3750,
    grossTotal: 7500,
    deductionsTotal: 1200,
    netTotal: 6300,
    createdAt: new Date().toISOString(),
  },
];

export async function getPayslip(id: string): Promise<Payslip> {
  try {
    const res = await apiClient.get<Payslip>(`/payslips/${id}`);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = mockPayslipsStore.find((p) => p.id === id || p.employeeId === id);
        if (found) {
          resolve(found);
        } else {
          // generate fallback
          const emp = MOCK_EMPLOYEES.find((e) => e.id === id) || MOCK_EMPLOYEES[0];
          const lines = createDefaultLines(6500);
          const newPs: Payslip = {
            id: `ps-${id}`,
            payrunId: 'pr-demo',
            employeeId: emp.id,
            employeeName: emp.name,
            employeeEmail: emp.workEmail,
            department: emp.department,
            jobPosition: emp.jobPosition,
            periodStart: '2026-09-01',
            periodEnd: '2026-09-30',
            status: 'Validated',
            lines,
            basicTotal: 3250,
            allowancesTotal: 3250,
            grossTotal: 6500,
            deductionsTotal: 1040,
            netTotal: 5460,
          };
          resolve(newPs);
        }
      }, 150);
    });
  }
}

export async function getPayslipsByPayrun(payrunId: string): Promise<Payslip[]> {
  try {
    const res = await apiClient.get<Payslip[]>(`/payruns/${payrunId}/payslips`);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = mockPayslipsStore.filter((p) => p.payrunId === payrunId);
        if (list.length > 0) {
          resolve(list);
        } else {
          // Return default list for any payrunId
          resolve(mockPayslipsStore.map(p => ({ ...p, payrunId })));
        }
      }, 200);
    });
  }
}

/** Print / Open Payslip PDF binary endpoint in a new window/tab */
export async function printPayslipPdf(payslipId: string): Promise<void> {
  try {
    const response = await apiClient.get(`/payslips/${payslipId}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch {
    // Client-side fallback PDF HTML print window
    const payslip = mockPayslipsStore.find(p => p.id === payslipId) || mockPayslipsStore[0];
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payslip - ${payslip.employeeName} (${payslip.periodStart})</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
              .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
              .header h1 { margin: 0; color: #0f172a; font-size: 24px; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; }
              .meta-item { font-size: 14px; }
              .meta-item strong { color: #475569; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { padding: 10px 14px; text-align: left; border-bottom: 1fr solid #e2e8f0; font-size: 14px; }
              th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
              .category-row { background-color: #f8fafc; font-weight: bold; }
              .amount { text-align: right; }
              .totals { font-size: 16px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #0f172a; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>PAYSLIP STATEMENT</h1>
                <p style="margin: 4px 0 0; color: #64748b;">PeoplePay360 HR & Payroll Systems</p>
              </div>
              <div style="text-align: right;">
                <h3 style="margin:0; color:#0284c7;"># ${payslip.id}</h3>
                <p style="margin: 4px 0 0; color: #64748b;">Period: ${payslip.periodStart} to ${payslip.periodEnd}</p>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item"><strong>Employee Name:</strong> ${payslip.employeeName}</div>
              <div class="meta-item"><strong>Department:</strong> ${payslip.department || 'N/A'}</div>
              <div class="meta-item"><strong>Position:</strong> ${payslip.jobPosition || 'N/A'}</div>
              <div class="meta-item"><strong>Work Email:</strong> ${payslip.employeeEmail || 'N/A'}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Component Name</th>
                  <th>Category</th>
                  <th class="amount">Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                ${payslip.lines.map(line => `
                  <tr>
                    <td><code>${line.code}</code></td>
                    <td>${line.name}</td>
                    <td><strong>${line.category}</strong></td>
                    <td class="amount">$${line.amount.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <p style="margin: 4px 0;">Gross Earnings: $${payslip.grossTotal.toLocaleString()}</p>
              <p style="margin: 4px 0; color: #dc2626;">Total Deductions: -$${payslip.deductionsTotal.toLocaleString()}</p>
              <p style="margin: 8px 0 0; color: #16a34a; font-size: 20px;">Net Payable Amount: $${payslip.netTotal.toLocaleString()}</p>
            </div>
            <script>
              window.onload = function() { window.print(); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}

export interface BulkSendResult {
  employeeId: string;
  employeeName: string;
  success: boolean;
  message: string;
}

/** Bulk send payslips to all employees in a payrun */
export async function sendPayrunBulkPayslips(payrunId: string): Promise<BulkSendResult[]> {
  try {
    const res = await apiClient.post<BulkSendResult[]>(`/payruns/${payrunId}/send-payslips`);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payslips = mockPayslipsStore.filter(p => p.payrunId === payrunId);
        const resultsToUse = payslips.length > 0 ? payslips : mockPayslipsStore;
        
        const results: BulkSendResult[] = resultsToUse.map((ps, idx) => {
          // Simulate 1 random failure if more than 2 items for demonstration
          const isSuccess = idx !== 2;
          if (isSuccess) {
            ps.status = 'Sent';
          }
          return {
            employeeId: ps.employeeId,
            employeeName: ps.employeeName,
            success: isSuccess,
            message: isSuccess
              ? `Payslip email sent to ${ps.employeeEmail || ps.employeeName}`
              : `Delivery failed: Invalid email mailbox response`,
          };
        });
        resolve(results);
      }, 600);
    });
  }
}
