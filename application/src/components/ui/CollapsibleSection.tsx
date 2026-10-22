import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './cn';

export interface CollapsibleSectionProps {
  id: string;
  title: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  expanded,
  onToggle,
  children,
  icon,
  badge,
  className,
}) => (
  <section className={cn('border-b border-slate-800', className)}>
    <h2>
      <button
        id={`${id}-trigger`}
        type="button"
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400"
      >
        {icon && (
          <span className="shrink-0 text-slate-500" aria-hidden>
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {title}
        </span>
        {badge}
        <ChevronDown
          aria-hidden
          className={cn(
            'h-4 w-4 shrink-0 text-slate-500 transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>
    </h2>
    {expanded && (
      <div
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        className="px-4 pb-4"
      >
        {children}
      </div>
    )}
  </section>
);

CollapsibleSection.displayName = 'CollapsibleSection';
