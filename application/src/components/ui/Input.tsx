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
        'outline-none transition placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'default' &&
          'w-full border bg-surface px-3 py-2 text-sm text-text',
        variant === 'default' &&
          (invalid ? 'border-danger focus-visible:ring-danger/60' : 'border-border'),
        className,
      )}
    />
  ),
);

Input.displayName = 'Input';
