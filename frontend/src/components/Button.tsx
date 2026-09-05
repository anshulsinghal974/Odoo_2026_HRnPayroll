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
    'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white ' +
    'border border-indigo-700/20 shadow-sm hover:shadow-md ' +
    'focus-visible:ring-indigo-500',
  secondary:
    'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 ' +
    'border border-gray-200 shadow-xs hover:border-gray-300 ' +
    'focus-visible:ring-gray-400',
  danger:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white ' +
    'border border-red-700/20 shadow-sm ' +
    'focus-visible:ring-red-500',
  outline:
    'bg-transparent hover:bg-indigo-50 active:bg-indigo-100 ' +
    'text-indigo-600 border border-indigo-300 hover:border-indigo-400 ' +
    'focus-visible:ring-indigo-500',
  ghost:
    'bg-transparent hover:bg-gray-100 active:bg-gray-200 ' +
    'text-gray-600 hover:text-gray-900 border border-transparent ' +
    'focus-visible:ring-gray-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs  px-3   py-1.5 rounded-lg  gap-1.5 h-8',
  md: 'text-sm  px-4   py-2   rounded-xl  gap-2   h-10',
  lg: 'text-[15px] px-5 py-2.5 rounded-xl gap-2.5 h-12 font-semibold',
};

const spinnerColorMap: Record<ButtonVariant, 'white' | 'primary' | 'neutral' | 'danger'> = {
  primary:   'white',
  secondary: 'neutral',
  danger:    'white',
  outline:   'primary',
  ghost:     'neutral',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled  = false,
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
          relative inline-flex items-center justify-center font-medium
          transition-all duration-150 select-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled
            ? 'opacity-55 cursor-not-allowed pointer-events-none'
            : 'cursor-pointer active:scale-[0.98]'
          }
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} color={spinnerColorMap[variant]} />
            <span className="opacity-75">{children}</span>
          </>
        ) : (
          <>
            {leftIcon  && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
