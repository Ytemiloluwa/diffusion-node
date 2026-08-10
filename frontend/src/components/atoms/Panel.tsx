import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type PanelProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
};

export function Panel({ actions, children, className, description, title, ...props }: PanelProps) {
  return (
    <section
      className={cn('rounded-panel border border-line bg-surface shadow-panel', className)}
      {...props}
    >
      {title || description || actions ? (
        <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-semibold text-ink">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}
