// Payrun Processing Screen — with Payslip Delivery, PDF Download & Bulk Send UI
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert, Modal } from '../../components';
import { getPayrun, computePayrun, validatePayrun, markPayrunPaid, sendPayrun } from '../../api/payruns';
import { getPayslipsByPayrun, printPayslipPdf, sendPayrunBulkPayslips, type BulkSendResult } from '../../api/payslips';
import type { Payrun, Payslip } from '../../types';
import { useRBAC } from '../../hooks/useRBAC';

// Define the possible statuses
const STATUS_STEPS = ['Draft', 'Computed', 'Validated', 'Paid'] as const;
type Status = typeof STATUS_STEPS[number];

export const PayrunProcessing: React.FC = () => {
  const { payrunId } = useParams<{ payrunId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canValidatePayrun, canMarkPaid, canSendPayslips } = useRBAC();

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkSendResult[] | null>(null);

  // Load payrun details
  const {
    data: payrun,
    isLoading: loadingPayrun,
    isError: errPayrun,
  } = useQuery<Payrun>({
    queryKey: ['payrun', payrunId],
    queryFn: () => getPayrun(payrunId!) as Promise<Payrun>,
    enabled: !!payrunId,
  });

  // Load payslips for this payrun
  const {
    data: payslips,
    isLoading: loadingPayslips,
  } = useQuery<Payslip[]>({
    queryKey: ['payslips', payrunId],
    queryFn: () => getPayslipsByPayrun(payrunId!),
    enabled: !!payrunId,
  });

  // Local state for status
  const [status, setStatus] = useState<Status>('Draft');

  useEffect(() => {
    if (payrun?.status) {
      setStatus(payrun.status as Status);
    }
  }, [payrun?.status]);

  // Mutations for step transitions
  const computeMutation = useMutation({
    mutationFn: () => computePayrun(payrunId!),
    onSuccess: () => {
      setStatus('Computed');
      queryClient.invalidateQueries({ queryKey: ['payrun', payrunId] });
      queryClient.invalidateQueries({ queryKey: ['payslips', payrunId] });
    },
  });

  const validateMutation = useMutation({
    mutationFn: () => validatePayrun(payrunId!),
    onSuccess: () => {
      setStatus('Validated');
      queryClient.invalidateQueries({ queryKey: ['payrun', payrunId] });
      queryClient.invalidateQueries({ queryKey: ['payslips', payrunId] });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: () => markPayrunPaid(payrunId!),
    onSuccess: () => {
      setStatus('Paid');
      queryClient.invalidateQueries({ queryKey: ['payrun', payrunId] });
      queryClient.invalidateQueries({ queryKey: ['payslips', payrunId] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => sendPayrun(payrunId!),
    onSuccess: () => {
      navigate('/payroll');
    },
  });

  // Bulk send payslips mutation
  const bulkSendMutation = useMutation({
    mutationFn: () => sendPayrunBulkPayslips(payrunId!),
    onSuccess: (results) => {
      setBulkResults(results);
      setIsBulkModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['payslips', payrunId] });
      queryClient.invalidateQueries({ queryKey: ['payrun', payrunId] });
    },
  });

  if (loadingPayrun) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" label="Loading payrun details…" />
      </div>
    );
  }

  if (errPayrun || !payrun) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Alert type="error" message="Unable to load payrun details." />
      </div>
    );
  }

  const handlePrintSingle = (payslipId: string) => {
    printPayslipPdf(payslipId);
  };

  const handleConfirmBulkSend = () => {
    bulkSendMutation.mutate();
  };

  // Helper to render stepper UI
  const renderStepper = () => (
    <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
      {STATUS_STEPS.map((step) => {
        const stepIndex = STATUS_STEPS.indexOf(step);
        const currentIndex = STATUS_STEPS.indexOf(status);
        const variant =
          step === status
            ? 'primary'
            : stepIndex < currentIndex
            ? 'success'
            : 'neutral';
        return (
          <div key={step} className="flex items-center shrink-0">
            <Badge variant={variant} size="md">
              {step}
            </Badge>
            {step !== STATUS_STEPS[STATUS_STEPS.length - 1] && (
              <span className="mx-2 text-neutral-400">→</span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Top Header Card */}
      <Card className="p-6 bg-white shadow-sm border border-neutral-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Payrun Processing – #{payrun.id}</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Period: {payrun.periodStart} to {payrun.periodEnd} • Structure ID: {payrun.salaryStructureId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkModalOpen(true)}
              disabled={bulkSendMutation.isPending || !payslips || payslips.length === 0}
            >
              ✉️ Send Payslips (Bulk)
            </Button>
          </div>
        </div>

        {renderStepper()}

        {/* Action Stage Buttons */}
        <div className="flex flex-wrap space-x-3 pt-4 border-t border-neutral-100">
          <Button
            variant="primary"
            size="sm"
            disabled={status !== 'Draft' || computeMutation.isPending}
            onClick={() => computeMutation.mutate()}
          >
            {computeMutation.isPending ? <Spinner size="sm" /> : 'Compute'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={status !== 'Computed' || validateMutation.isPending || !canValidatePayrun}
            onClick={() => validateMutation.mutate()}
            title={!canValidatePayrun ? 'Requires HR Payroll Manager role' : undefined}
          >
            {validateMutation.isPending ? <Spinner size="sm" /> : 'Validate'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={status !== 'Validated' || markPaidMutation.isPending || !canMarkPaid}
            onClick={() => markPaidMutation.mutate()}
            title={!canMarkPaid ? 'Requires HR Payroll Manager role' : undefined}
          >
            {markPaidMutation.isPending ? <Spinner size="sm" /> : 'Mark Paid'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={status !== 'Paid' || sendMutation.isPending || !canSendPayslips}
            onClick={() => sendMutation.mutate()}
            title={!canSendPayslips ? 'Requires HR Payroll Manager role' : undefined}
          >
            {sendMutation.isPending ? <Spinner size="sm" /> : 'Send Payrun'}
          </Button>
        </div>
      </Card>

      {/* Toast Notification Results for Bulk Send per Employee */}
      {bulkResults && (
        <Card className="p-5 bg-neutral-900 text-white shadow-lg space-y-3">
          <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
            <h3 className="text-sm font-semibold text-neutral-200">Bulk Payslip Email Dispatch Log</h3>
            <button
              onClick={() => setBulkResults(null)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {bulkResults.map((res) => (
              <div
                key={res.employeeId}
                className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
                  res.success
                    ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-200'
                    : 'bg-rose-950/70 border-rose-700/80 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{res.success ? '✅' : '❌'}</span>
                  <span className="font-semibold">{res.employeeName}</span>
                </div>
                <span>{res.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payslips List Table */}
      <Card className="p-6 bg-white shadow-sm border border-neutral-200 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Employee Payslips</h2>
            <p className="text-xs text-neutral-500">
              Generated payslips for all included employees ({payslips?.length || 0} total)
            </p>
          </div>
        </div>

        {loadingPayslips ? (
          <div className="py-8 text-center">
            <Spinner size="md" label="Loading employee payslips..." />
          </div>
        ) : !payslips || payslips.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-sm">
            No payslips found for this payrun.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Net Salary</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payslips.map((ps) => (
                  <tr key={ps.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900">{ps.employeeName}</div>
                      <div className="text-xs text-neutral-500">{ps.employeeEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-600">
                      {ps.department || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                      ${ps.netTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={ps.status === 'Sent' ? 'success' : 'neutral'} size="sm">
                        {ps.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/payroll/payslips/${ps.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintSingle(ps.id)}
                        >
                          Print PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirmation Modal for Bulk Sending Payslips */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Confirm Bulk Payslip Dispatch"
        description={`Send automated digital payslip emails to all ${payslips?.length || 0} employees included in this payrun.`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmBulkSend}
              disabled={bulkSendMutation.isPending}
            >
              {bulkSendMutation.isPending ? <Spinner size="sm" /> : 'Confirm & Send All'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert type="info" message="This action will process digital delivery and dispatch salary statements to registered employee work emails." />

          <div className="border rounded-lg p-3 bg-neutral-50 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Payrun Reference:</span>
              <span className="font-mono font-semibold text-neutral-900">{payrun.id}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Total Recipients:</span>
              <span className="font-semibold text-neutral-900">{payslips?.length || 0} employees</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Method:</span>
              <span className="font-semibold text-neutral-900">Email Attachment + Web Portal</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
