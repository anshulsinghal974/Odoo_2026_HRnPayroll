import React from 'react';

type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  /** Optional additional content */
  children?: React.ReactNode;
}

/**
 * Simple reusable alert component.
 * Uses Tailwind CSS utility classes for styling based on the alert type.
 * Accessible with role="alert" and appropriate ARIA attributes.
 */
export const Alert: React.FC<AlertProps> = ({ type, message, children }) => {
  const baseClasses =
    'p-4 rounded-md border flex items-start space-x-3 text-sm';
  const typeMap: Record<AlertType, string> = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div role="alert" className={`${baseClasses} ${typeMap[type]}`}>
      <div className="flex-1">
        <p>{message}</p>
        {children}
      </div>
    </div>
  );
};
