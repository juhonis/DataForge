import React from 'react';
import { cn } from './cn';

export interface FieldProps {
  label: React.ReactNode;
  htmlFor: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  children,
  hint,
  error,
  className,
  labelClassName,
}) => (
  <div className={cn('space-y-1.5', className)}>
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-[10px] font-semibold uppercase tracking-wide text-muted',
        labelClassName,
      )}
    >
      {label}
    </label>
    {children}
    {hint && !error && (
      <p className="text-[11px] leading-relaxed text-muted">{hint}</p>
    )}
    {error && (
      <p role="alert" className="text-[11px] leading-relaxed text-danger">
        {error}
      </p>
    )}
  </div>
);

Field.displayName = 'Field';
