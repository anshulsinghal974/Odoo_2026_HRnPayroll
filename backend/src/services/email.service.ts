import nodemailer, { Transporter } from 'nodemailer';
import { prisma } from '../db/prisma';
import { generatePayslipPdf } from './pdf.service';
import { PayrunStatus } from '@prisma/client';

export interface SendPayslipEmailOptions {
  to: string;
  employeeName: string;
  payrunName: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  pdfBuffer: Buffer;
}

export interface BulkEmailDeliveryResult {
  payrunId: string;
  total: number;
  sent: number;
  failed: number;
  warnings: string[];
}

/**
 * Creates and caches a Nodemailer transporter.
 * Falls back gracefully to JSON/simulated transport if SMTP credentials are not configured.
 */
let cachedTransporter: Transporter | null = null;

export async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Development / Mock transport mode
    // Allows reliable testing and demoing without requiring active external SMTP
    console.log('[EmailService] Using simulated JSON mail transport (no SMTP credentials configured)');
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return cachedTransporter;
}

/**
 * Sends a single payslip PDF to an employee email
 */
export async function sendPayslipEmail(
  options: SendPayslipEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'payroll@peoplepay360.com';

    const cleanName = options.employeeName.replace(/\s+/g, '_');
    const filename = `Payslip_${cleanName}.pdf`;

    const info = await transporter.sendMail({
      from: `"PeoplePay360 Payroll" <${fromAddress}>`,
      to: options.to,
      subject: `Payslip for ${options.payrunName} - PeoplePay360`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">PeoplePay360</h2>
          <p style="font-size: 14px; margin-bottom: 16px;">Dear <strong>${options.employeeName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
            Your salary slip for <strong>${options.payrunName}</strong> has been generated and is attached to this email as a PDF.
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 16px; margin-bottom: 20px; font-size: 13px;">
            <p style="margin: 0;"><strong>Pay Period:</strong> ${new Date(options.periodStart).toLocaleDateString()} – ${new Date(options.periodEnd).toLocaleDateString()}</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">
            Please review the attached document for full earnings, allowances, and statutory deductions. If you have any questions regarding your payslip, please contact the HR department.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            This is an automated notification from PeoplePay360. Please do not reply directly to this email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: options.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return {
      success: true,
      messageId: info.messageId || 'MOCK_ID',
    };
  } catch (error: any) {
    console.error(`[EmailService] Failed to send email to ${options.to}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown email error',
    };
  }
}

/**
 * Bulk delivers payslips via email for an entire payrun,
 * logging delivery timestamp (`emailSentAt`) per payslip.
 */
export async function sendBulkPayslipsForPayrun(payrunId: string): Promise<BulkEmailDeliveryResult> {
  const payrun = await prisma.payrun.findUnique({
    where: { id: payrunId },
    include: {
      payslips: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!payrun) {
    throw { statusCode: 404, message: 'Payrun not found' };
  }

  // Must be in VALIDATED or PAID status
  if (payrun.status !== PayrunStatus.VALIDATED && payrun.status !== PayrunStatus.PAID) {
    throw {
      statusCode: 400,
      message: `Cannot send payslips for payrun with status "${payrun.status}". Payrun must be VALIDATED or PAID first.`,
    };
  }

  let sent = 0;
  let failed = 0;
  const warnings: string[] = [];

  for (const payslip of payrun.payslips) {
    const empName = `${payslip.employee.firstName} ${payslip.employee.lastName}`;
    const email = payslip.employee.email?.trim();

    if (!email) {
      warnings.push(`Missing email: Employee ${empName} has no registered email address`);
      failed++;
      continue;
    }

    try {
      // 1. Generate PDF for this payslip
      const pdfBuffer = await generatePayslipPdf(payslip.id);

      // 2. Send Email
      const emailResult = await sendPayslipEmail({
        to: email,
        employeeName: empName,
        payrunName: payrun.name,
        periodStart: payrun.periodStart,
        periodEnd: payrun.periodEnd,
        pdfBuffer,
      });

      if (emailResult.success) {
        // 3. Log delivery status per payslip
        await prisma.payslip.update({
          where: { id: payslip.id },
          data: {
            emailSentAt: new Date(),
          },
        });
        sent++;
      } else {
        warnings.push(`Delivery failed for ${empName} (${email}): ${emailResult.error}`);
        failed++;
      }
    } catch (err: any) {
      warnings.push(`Error preparing payslip for ${empName}: ${err.message}`);
      failed++;
    }
  }

  return {
    payrunId: payrun.id,
    total: payrun.payslips.length,
    sent,
    failed,
    warnings,
  };
}
