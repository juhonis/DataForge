import React from 'react';
import { Check } from 'lucide-react';
import { cn } from './cn';

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'className'
  > {
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, disabled, ...props }, ref) => (
    <label
      className={cn(
        'group inline-flex cursor-pointer select-none items-start gap-2.5',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className="h-5 w-5 rounded border border-slate-600 bg-slate-900 transition-colors peer-checked:border-indigo-500 peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900"
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && (
            <span className="block text-sm leading-5 text-slate-300">
              {label}
            </span>
          )}
          {description && (
            <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  ),
);

Checkbox.displayName = 'Checkbox';
