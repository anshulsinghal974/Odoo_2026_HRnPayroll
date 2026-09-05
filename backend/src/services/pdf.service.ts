import puppeteer from 'puppeteer';
import { prisma } from '../db/prisma';

/**
 * Formats currency values in INR / standard currency format
 */
function formatCurrency(amount: number | string | null | undefined): string {
  const val = Number(amount) || 0;
  return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Generates an executive-grade, beautifully styled HTML template for the payslip
 */
export function generatePayslipHtml(payslip: any): string {
  const employee = payslip.employee || {};
  const payrun = payslip.payrun || {};
  const contract = payslip.contract || {};
  const lines = payslip.lines || [];

  const basicLines = lines.filter((l: any) => l.category === 'BASIC');
  const allowanceLines = lines.filter((l: any) => l.category === 'ALLOWANCE');
  const deductionLines = lines.filter((l: any) => l.category === 'DEDUCTION');

  const totalEarnings = [...basicLines, ...allowanceLines].reduce(
    (sum: number, l: any) => sum + Number(l.amount || 0),
    0
  );
  const totalDeductions = deductionLines.reduce(
    (sum: number, l: any) => sum + Number(l.amount || 0),
    0
  );
  const netPay = payslip.netAmount !== null && payslip.netAmount !== undefined
    ? Number(payslip.netAmount)
    : totalEarnings - totalDeductions;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payslip - ${employee.firstName} ${employee.lastName}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      padding: 32px 36px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .brand-title span {
      color: #4f46e5;
    }
    .brand-subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-top: 4px;
    }
    .payslip-badge {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 16px;
      border-radius: 8px;
      text-align: right;
    }
    .payslip-badge h2 {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .payslip-badge p {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 24px;
      margin-bottom: 24px;
    }
    .meta-col h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #475569;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .meta-label {
      color: #64748b;
      font-weight: 500;
    }
    .meta-value {
      color: #0f172a;
      font-weight: 600;
    }

    .breakdown-table-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .breakdown-box {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .box-header {
      background-color: #f1f5f9;
      padding: 10px 16px;
      font-weight: 700;
      font-size: 13px;
      color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px 16px;
      text-align: left;
      font-size: 12px;
    }
    td.amount {
      text-align: right;
      font-weight: 600;
      color: #0f172a;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .subtotal-row {
      background-color: #f1f5f9 !important;
      font-weight: 700;
      border-top: 1px solid #cbd5e1;
    }
    .subtotal-row td {
      font-weight: 700;
      color: #0f172a;
    }

    .net-pay-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      color: #ffffff;
      padding: 20px 24px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .net-pay-banner .label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #c7d2fe;
    }
    .net-pay-banner .subtext {
      font-size: 11px;
      color: #e0e7ff;
      margin-top: 4px;
    }
    .net-pay-banner .amount {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .footer {
      text-align: center;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      color: #94a3b8;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">People<span>Pay360</span></div>
      <div class="brand-subtitle">Smart HR & Payroll Platform</div>
    </div>
    <div class="payslip-badge">
      <h2>Payslip</h2>
      <p>${payrun.name || 'Monthly Payroll'}</p>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <h3>Employee Information</h3>
      <div class="meta-row">
        <span class="meta-label">Name:</span>
        <span class="meta-value">${employee.firstName || ''} ${employee.lastName || ''}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Email:</span>
        <span class="meta-value">${employee.email || 'N/A'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Department:</span>
        <span class="meta-value">${employee.department || 'N/A'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Job Position:</span>
        <span class="meta-value">${employee.jobPosition || 'N/A'}</span>
      </div>
    </div>
    <div class="meta-col">
      <h3>Payroll & Bank Details</h3>
      <div class="meta-row">
        <span class="meta-label">Pay Period:</span>
        <span class="meta-value">${formatDate(payrun.periodStart)} – ${formatDate(payrun.periodEnd)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Worked Days:</span>
        <span class="meta-value">${payslip.workedDays || '22'} days</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Bank Account:</span>
        <span class="meta-value">${employee.bankAccount ? `•••• ${String(employee.bankAccount).slice(-4)}` : 'N/A'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Contract Wage:</span>
        <span class="meta-value">${formatCurrency(contract.wage)}</span>
      </div>
    </div>
  </div>

  <div class="breakdown-table-container">
    <div class="breakdown-box">
      <div class="box-header">Earnings & Allowances</div>
      <table>
        <tbody>
          ${[...basicLines, ...allowanceLines]
            .map(
              (line: any) => `
              <tr>
                <td>${line.ruleName}</td>
                <td class="amount">${formatCurrency(line.amount)}</td>
              </tr>
            `
            )
            .join('')}
          <tr class="subtotal-row">
            <td>Total Earnings</td>
            <td class="amount">${formatCurrency(totalEarnings)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="breakdown-box">
      <div class="box-header">Deductions</div>
      <table>
        <tbody>
          ${deductionLines.length > 0
            ? deductionLines
                .map(
                  (line: any) => `
                <tr>
                  <td>${line.ruleName}</td>
                  <td class="amount">${formatCurrency(line.amount)}</td>
                </tr>
              `
                )
                .join('')
            : '<tr><td colspan="2" style="color:#94a3b8; text-align:center;">No deductions applied</td></tr>'}
          <tr class="subtotal-row">
            <td>Total Deductions</td>
            <td class="amount">${formatCurrency(totalDeductions)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="net-pay-banner">
    <div>
      <div class="label">Net Payable Amount</div>
      <div class="subtext">Credited to employee bank account</div>
    </div>
    <div class="amount">${formatCurrency(netPay)}</div>
  </div>

  <div class="footer">
    This is a system-generated document from PeoplePay360. No physical signature is required. • Generated on ${formatDate(
      new Date()
    )}
  </div>
</body>
</html>
  `;
}

/**
 * Renders a payslip to a PDF buffer using Puppeteer
 */
export async function generatePayslipPdf(payslipId: string): Promise<Buffer> {
  const payslip = await prisma.payslip.findUnique({
    where: { id: payslipId },
    include: {
      payrun: {
        include: {
          structure: { select: { id: true, name: true } },
        },
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          jobPosition: true,
          bankAccount: true,
          bankName: true,
        },
      },
      contract: {
        select: {
          id: true,
          name: true,
          wage: true,
          startDate: true,
          endDate: true,
        },
      },
      lines: {
        orderBy: { sequence: 'asc' },
      },
    },
  });

  if (!payslip) {
    throw { statusCode: 404, message: 'Payslip not found' };
  }

  const html = generatePayslipHtml(payslip);

  // Launch Puppeteer headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
