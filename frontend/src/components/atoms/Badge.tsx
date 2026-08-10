import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'amber' | 'emerald' | 'red' | 'slate' | 'sky';

const toneClasses: Record<BadgeTone, string> = {
  amber: 'bg-warning-soft text-warning ring-warning-line',
  emerald: 'bg-success-soft text-success ring-success-line',
  red: 'bg-danger-soft text-danger ring-danger-line',
  sky: 'bg-info-soft text-info ring-info-line',
  slate: 'bg-surface-muted text-ink-soft ring-line',
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ children, className, tone = 'slate', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center rounded-control px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
