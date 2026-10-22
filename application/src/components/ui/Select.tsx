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
        'outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'default' &&
          'w-full rounded-lg border bg-slate-800 px-3 py-2 text-sm text-slate-300',
        variant === 'default' &&
          (invalid ? 'border-red-500' : 'border-slate-700'),
        variant === 'bare' && 'bg-transparent text-sm text-slate-300',
        className,
      )}
    />
  ),
);

Select.displayName = 'Select';
