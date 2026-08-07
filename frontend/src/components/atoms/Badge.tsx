import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'amber' | 'emerald' | 'red' | 'slate' | 'sky';

const toneClasses: Record<BadgeTone, string> = {
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  red: 'bg-red-50 text-red-800 ring-red-200',
  sky: 'bg-sky-50 text-sky-800 ring-sky-200',
  slate: 'bg-slate-100 text-slate-800 ring-slate-200',
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ children, className, tone = 'slate', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
