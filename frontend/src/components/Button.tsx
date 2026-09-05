import React from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow focus-visible:ring-primary-500 border border-primary-700/20',
  secondary:
    'bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 border border-neutral-300 shadow-sm focus-visible:ring-neutral-400',
  danger:
    'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white shadow-sm hover:shadow focus-visible:ring-danger-500 border border-danger-700/20',
  outline:
    'bg-transparent hover:bg-primary-50 active:bg-primary-100 text-primary-600 border border-primary-600 focus-visible:ring-primary-500',
  ghost:
    'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-600 hover:text-neutral-900 border border-transparent focus-visible:ring-neutral-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-8',
  md: 'text-sm px-4 py-2 rounded-xl gap-2 h-10',
  lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 h-12 font-medium',
};

const spinnerColorMap: Record<ButtonVariant, 'white' | 'primary' | 'neutral' | 'danger'> = {
  primary: 'white',
  secondary: 'neutral',
  danger: 'white',
  outline: 'primary',
  ghost: 'neutral',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          relative inline-flex items-center justify-center font-medium transition-all duration-150 select-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-[0.98]'}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner
              size={size === 'lg' ? 'md' : 'sm'}
              color={spinnerColorMap[variant]}
            />
            <span className="opacity-80">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
