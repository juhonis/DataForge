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
    'text-muted hover:bg-surface-muted hover:text-accent focus-visible:ring-accent',
  primary:
    'text-accent hover:bg-accent-muted hover:text-accent-hover focus-visible:ring-accent',
  plain: '',
  success:
    'text-success hover:bg-success-muted hover:text-success-hover focus-visible:ring-success',
  danger:
    'text-muted hover:bg-danger-muted hover:text-danger focus-visible:ring-danger',
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
        'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

IconButton.displayName = 'IconButton';
