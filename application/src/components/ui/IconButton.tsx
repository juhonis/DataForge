import React from 'react';
import { cn } from './cn';

export type IconButtonVariant =
  | 'ghost'
  | 'primary'
  | 'plain'
  | 'success'
  | 'danger';
export type IconButtonSize = 'sm' | 'md';

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const variantClasses: Record<IconButtonVariant, string> = {
  ghost:
    'text-slate-500 hover:bg-slate-800 hover:text-indigo-400 focus-visible:ring-indigo-400',
  primary:
    'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 focus-visible:ring-indigo-400',
  plain: '',
  success:
    'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 focus-visible:ring-emerald-400',
  danger:
    'text-slate-500 hover:bg-red-500/10 hover:text-red-400 focus-visible:ring-red-400',
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'p-1',
  md: 'p-2',
};

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  IconButtonProps
>(
  (
    {
      className,
      label,
      title,
      variant = 'ghost',
      size = 'sm',
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      title={title ?? label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

IconButton.displayName = 'IconButton';
