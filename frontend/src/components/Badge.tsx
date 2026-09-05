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
  primary: 'bg-indigo-50  text-indigo-700  border-indigo-200/60',
  neutral: 'bg-gray-100   text-gray-600    border-gray-200/70',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50   text-amber-700   border-amber-200/70',
  danger:  'bg-red-50     text-red-700     border-red-200/60',
};

const dotClasses: Record<BadgeVariant, string> = {
  primary: 'bg-indigo-500',
  neutral: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500 animate-pulse',
  danger:  'bg-red-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2    py-0.5 font-medium leading-tight',
  md: 'text-xs     px-2.5  py-1   font-medium leading-none',
};

export const Badge: React.FC<BadgeProps> = ({
  variant  = 'primary',
  size     = 'md',
  dot      = false,
  pill     = true,
  leftIcon,
  children,
  className = '',
  ...props
}) => (
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
