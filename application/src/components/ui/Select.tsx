import React from 'react';
import { cn } from './cn';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'bare';
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant = 'default',
      invalid = false,
      ...props
    },
    ref,
  ) => (
    <select
      ref={ref}
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        'outline-none transition focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'default' &&
          'w-full border bg-surface px-3 py-2 text-sm text-text',
        variant === 'default' &&
          (invalid ? 'border-danger' : 'border-border'),
        variant === 'bare' && 'text-sm text-text',
        className,
      )}
    />
  ),
);

Select.displayName = 'Select';
