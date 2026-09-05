import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'white';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'w-3.5 h-3.5 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-[2.5px]',
  lg: 'w-8 h-8 border-3',
  xl: 'w-10 h-10 border-4',
};

const colorClasses: Record<SpinnerColor, string> = {
  primary: 'border-primary-200 border-t-primary-600',
  neutral: 'border-neutral-200 border-t-neutral-600',
  success: 'border-success-200 border-t-success-600',
  warning: 'border-warning-200 border-t-warning-600',
  danger: 'border-danger-200 border-t-danger-600',
  white: 'border-white/30 border-t-white',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status">
      <div
        className={`rounded-full animate-spin transition-all duration-150 ${sizeClasses[size]} ${colorClasses[color]}`}
        aria-hidden="true"
      />
      {label && (
        <span className="text-xs font-medium text-neutral-600">{label}</span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};
