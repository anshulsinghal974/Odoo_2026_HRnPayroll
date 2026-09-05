import React from 'react';

// ── Card ──────────────────────────────────────────────────────────────────────
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  /** Remove default padding from children — useful when you need flush content (tables, etc.) */
  flush?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, flush = false, className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        bg-white rounded-xl border border-gray-100 shadow-sm
        transition-all duration-200
        ${hoverable ? 'hover:shadow-md hover:border-gray-200 cursor-pointer' : ''}
        ${flush ? '' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

// ── CardHeader ────────────────────────────────────────────────────────────────
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  bordered = true,
  className = '',
  children,
  ...props
}) => (
  <div
    className={`
      px-5 py-4 flex items-center justify-between gap-4
      ${bordered ? 'border-b border-gray-100' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
);

// ── CardTitle ─────────────────────────────────────────────────────────────────
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3
    className={`text-[15px] font-semibold text-gray-900 tracking-tight leading-snug ${className}`}
    {...props}
  >
    {children}
  </h3>
);

// ── CardDescription ───────────────────────────────────────────────────────────
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p
    className={`text-xs text-gray-500 mt-0.5 leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </p>
);

// ── CardContent ───────────────────────────────────────────────────────────────
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`px-5 py-4 ${className}`} {...props}>
    {children}
  </div>
);

// ── CardFooter ────────────────────────────────────────────────────────────────
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  bordered = true,
  className = '',
  children,
  ...props
}) => (
  <div
    className={`
      px-5 py-3.5 bg-gray-50/60 rounded-b-xl
      flex items-center justify-between gap-4
      ${bordered ? 'border-t border-gray-100' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
);
