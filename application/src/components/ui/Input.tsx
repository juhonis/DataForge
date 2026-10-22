import React from 'react';
import { cn } from './cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'bare';
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      invalid = false,
      ...props
    },
    ref,
  ) => (
    <input
      ref={ref}
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        'outline-none transition placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'default' &&
          'w-full rounded-lg border bg-slate-950 px-3 py-2 text-sm text-slate-200',
        variant === 'default' &&
          (invalid
            ? 'border-red-500 focus-visible:ring-red-400/60'
            : 'border-slate-700'),
        className,
      )}
    />
  ),
);

Input.displayName = 'Input';
