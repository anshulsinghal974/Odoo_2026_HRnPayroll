// Payrun Processing Screen

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert } from '../../components';
import { getPayrun, computePayrun, validatePayrun, markPayrunPaid, sendPayrun } from '../../api/payruns';
import type { Payrun } from '../../types';

// Define the possible statuses
const STATUS_STEPS = ['Draft', 'Computed', 'Validated', 'Paid'] as const;

type Status = typeof STATUS_STEPS[number];

export const PayrunProcessing: React.FC = () => {
  const { payrunId } = useParams<{ payrunId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load payrun details — React Query v5 object syntax
  const {
    data: payrun,
    isLoading: loadingPayrun,
    isError: errPayrun,
  } = useQuery<Payrun>({
    queryKey: ['payrun', payrunId],
    queryFn: () => getPayrun(payrunId!) as Promise<Payrun>,
    enabled: !!payrunId,
  });

  // Local state for status — initialised to 'Draft', synced once payrun loads
  const [status, setStatus] = useState<Status>('Draft');

  useEffect(() => {
    if (payrun?.status) {
      setStatus(payrun.status as Status);
    }
  }, [payrun?.status]);

  // Mutations for each action
  const computeMutation = useMutation({
    mutationFn: () => computePayrun(payrunId!),
    onSuccess: () => {
      setStatus('Computed');
      queryClient.invalidateQueries({ queryKey: ['payrun', payrunId] });
    },
  });

  const validateMutation = useMutation({
    mutationFn: () => validatePayrun(payrunId!),
    onSuccess: () => {
      setStatus('Validated');
      queryClient.invalidateQueries({ queryKey: ['payrun', payrunId] });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: () => markPayrunPaid(payrunId!),
    onSuccess: () => {
      setStatus('Paid');
      queryClient.invalidateQueries({ queryKey: ['payrun', payrunId] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => sendPayrun(payrunId!),
    onSuccess: () => {
      navigate('/payroll');
    },
  });

  if (loadingPayrun) {
    return <Spinner size="lg" label="Loading payrun…" />;
  }
  if (errPayrun || !payrun) {
    return <Alert type="error" message="Unable to load payrun details." />;
  }

  // Helper to render stepper UI — Badge only accepts 'sm' | 'md' for size
  const renderStepper = () => (
    <div className="flex items-center space-x-4 mb-6">
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
          <div key={step} className="flex items-center">
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

  // Warning panel placeholder
  const renderWarningPanel = () => (
    <Alert
      type="warning"
      message="Some warning messages will appear here once validation runs."
    />
  );

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Payrun Processing – #{payrun.id}</h2>

      {renderStepper()}

      {/* Warning panel */}
      {renderWarningPanel()}

      {/* Action buttons – enable/disable based on current status */}
      <div className="flex space-x-3 mt-6">
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
          disabled={status !== 'Computed' || validateMutation.isPending}
          onClick={() => validateMutation.mutate()}
        >
          {validateMutation.isPending ? <Spinner size="sm" /> : 'Validate'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          disabled={status !== 'Validated' || markPaidMutation.isPending}
          onClick={() => markPaidMutation.mutate()}
        >
          {markPaidMutation.isPending ? <Spinner size="sm" /> : 'Mark Paid'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={status !== 'Paid' || sendMutation.isPending}
          onClick={() => sendMutation.mutate()}
        >
          {sendMutation.isPending ? <Spinner size="sm" /> : 'Send'}
        </Button>
      </div>
    </Card>
  );
};
