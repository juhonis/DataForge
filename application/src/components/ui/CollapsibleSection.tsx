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
  <section className={cn('border-b border-border', className)}>
    <h2>
      <button
        id={`${id}-trigger`}
        type="button"
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        {icon && (
          <span className="shrink-0 text-muted" aria-hidden>
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-text">
          {title}
        </span>
        {badge}
        <ChevronDown
          aria-hidden
          className={cn(
            'h-4 w-4 shrink-0 text-muted transition-transform',
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
        className="px-5 pb-4"
      >
        {children}
      </div>
    )}
  </section>
);

CollapsibleSection.displayName = 'CollapsibleSection';
