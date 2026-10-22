import React from 'react';
import { cn } from './cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'sm' | 'md';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-400',
  secondary:
    'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:ring-slate-400',
  ghost:
    'text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:ring-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
