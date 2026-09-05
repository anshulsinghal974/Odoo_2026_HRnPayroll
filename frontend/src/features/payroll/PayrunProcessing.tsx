// Payrun Processing Screen

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert } from '../../components';
import { getPayrun, computePayrun, validatePayrun, markPayrunPaid, sendPayrun } from '../../api/payruns';
import type { Payrun } from '../../types';

// Define the possible statuses
const STATUS_STEPS = ['Draft', 'Computed', 'Validated', 'Paid'] as const;

type Status = typeof STATUS_STEPS[number];

export const PayrunProcessing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load payrun details
  const {
    data: payrun,
    isLoading: loadingPayrun,
    isError: errPayrun,
  } = useQuery<Payrun>(
    ['payrun', id],
    () => getPayrun(id!),
    { enabled: !!id }
  );

  // Local state for status (fallback to payrun.status)
  const [status, setStatus] = useState<Status>(payrun?.status ?? 'Draft');

  // Mutations for each action – these are placeholders that call the mock API
  const computeMutation = useMutation({
    mutationFn: () => computePayrun(id!),
    onSuccess: (data) => {
      setStatus('Computed');
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
    },
  });

  const validateMutation = useMutation({
    mutationFn: () => validatePayrun(id!),
    onSuccess: () => {
      setStatus('Validated');
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: () => markPayrunPaid(id!),
    onSuccess: () => {
      setStatus('Paid');
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => sendPayrun(id!),
    onSuccess: () => {
      // After sending, go back to list or show a success toast (placeholder)
      navigate('/payroll');
    },
  });

  if (loadingPayrun) {
    return <Spinner size="lg" label="Loading payrun…" />;
  }
  if (errPayrun || !payrun) {
    return <Alert type="error" message="Unable to load payrun details." />;
  }

  // Helper to render stepper UI
  const renderStepper = () => (
    <div className="flex items-center space-x-4 mb-6">
      {STATUS_STEPS.map((step) => (
        <div key={step} className="flex items-center">
          <Badge
            variant={status === step ? 'primary' : status === 'Draft' && step === 'Draft' ? 'neutral' : 'muted'}
            size="lg"
          >
            {step}
          </Badge>
          {step !== STATUS_STEPS[STATUS_STEPS.length - 1] && <span className="mx-2">→</span>}
        </div>
      ))}
    </div>
  );

  // Warning panel placeholder – could show validation warnings etc.
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
          disabled={status !== 'Draft' || computeMutation.isLoading}
          onClick={() => computeMutation.mutate()}
        >
          {computeMutation.isLoading ? <Spinner size="sm" /> : 'Compute'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          disabled={status !== 'Computed' || validateMutation.isLoading}
          onClick={() => validateMutation.mutate()}
        >
          {validateMutation.isLoading ? <Spinner size="sm" /> : 'Validate'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          disabled={status !== 'Validated' || markPaidMutation.isLoading}
          onClick={() => markPaidMutation.mutate()}
        >
          {markPaidMutation.isLoading ? <Spinner size="sm" /> : 'Mark Paid'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={status !== 'Paid' || sendMutation.isLoading}
          onClick={() => sendMutation.mutate()}
        >
          {sendMutation.isLoading ? <Spinner size="sm" /> : 'Send'}
        </Button>
      </div>
    </Card>
  );
};
