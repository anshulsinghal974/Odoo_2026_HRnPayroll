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
  primary: 'border-indigo-200 border-t-indigo-600',
  neutral: 'border-gray-200 border-t-gray-600',
  success: 'border-emerald-200 border-t-emerald-600',
  warning: 'border-amber-200 border-t-amber-600',
  danger:  'border-red-200 border-t-red-600',
  white:   'border-white/30 border-t-white',
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
        <span className="text-xs font-medium text-gray-600">{label}</span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};
