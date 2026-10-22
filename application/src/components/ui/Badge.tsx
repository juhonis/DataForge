import React from 'react';
import { cn } from './cn';

export type BadgeTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-muted',
  accent: 'bg-accent-muted text-accent',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  tone = 'neutral',
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold leading-none',
      toneClasses[tone],
      className,
    )}
    {...props}
  />
);

Badge.displayName = 'Badge';
