import React from 'react';
import { cn } from './cn';

export type BadgeTone = 'slate' | 'indigo' | 'emerald' | 'amber' | 'red';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  slate: 'bg-slate-800 text-slate-400',
  indigo: 'bg-indigo-500/15 text-indigo-300',
  emerald: 'bg-emerald-500/15 text-emerald-300',
  amber: 'bg-amber-500/15 text-amber-300',
  red: 'bg-red-500/15 text-red-300',
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  tone = 'slate',
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
      toneClasses[tone],
      className,
    )}
    {...props}
  />
);

Badge.displayName = 'Badge';
