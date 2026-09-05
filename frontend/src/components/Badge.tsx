import React from 'react';

export type BadgeVariant = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pill?: boolean;
  leftIcon?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-200/70',
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200/80',
  success: 'bg-success-50 text-success-700 border-success-200/70',
  warning: 'bg-warning-50 text-warning-800 border-warning-200/80',
  danger: 'bg-danger-50 text-danger-700 border-danger-200/70',
};

const dotClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  neutral: 'bg-neutral-400',
  success: 'bg-success-500',
  warning: 'bg-warning-500 animate-pulse',
  danger: 'bg-danger-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5 font-medium leading-tight',
  md: 'text-xs px-2.5 py-1 font-medium leading-none',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  dot = false,
  pill = true,
  leftIcon,
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 border transition-colors select-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant]}`}
          aria-hidden="true"
        />
      )}
      {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
      <span>{children}</span>
    </span>
  );
};
