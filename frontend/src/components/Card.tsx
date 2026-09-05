import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-card border border-neutral-200/80 shadow-card
          transition-all duration-200
          ${hoverable ? 'hover:shadow-card-hover hover:border-neutral-300/90' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  bordered = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`
        px-6 py-4 flex items-center justify-between gap-4
        ${bordered ? 'border-b border-neutral-100' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3
      className={`text-base font-semibold text-neutral-900 tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p
      className={`text-xs text-neutral-500 mt-0.5 leading-normal ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  bordered = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`
        px-6 py-3.5 bg-neutral-50/50 rounded-b-card flex items-center justify-between
        ${bordered ? 'border-t border-neutral-100' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
