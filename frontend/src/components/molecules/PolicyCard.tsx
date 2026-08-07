import { CalendarDays, FileText, Landmark } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Badge, type BadgeProps } from '@/components/atoms';
import { cn } from '@/lib/cn';

export type PolicyCardStatus = 'ACTIVE' | 'CONTESTED' | 'DRAFT' | 'RESCINDED' | 'SUPERSEDED';

const statusLabels: Record<PolicyCardStatus, string> = {
  ACTIVE: 'Active',
  CONTESTED: 'Contested',
  DRAFT: 'Draft',
  RESCINDED: 'Rescinded',
  SUPERSEDED: 'Superseded',
};

const statusTones: Record<PolicyCardStatus, BadgeProps['tone']> = {
  ACTIVE: 'emerald',
  CONTESTED: 'amber',
  DRAFT: 'slate',
  RESCINDED: 'red',
  SUPERSEDED: 'sky',
};

export type PolicyCardProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  companies?: string[];
  controlNumber?: string;
  countries?: string[];
  effectiveDate?: string;
  sourceName?: string;
  status: PolicyCardStatus;
  summary?: string;
  technologies?: string[];
  title: string;
};

function DetailList({ items }: { items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} tone="slate">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function PolicyCard({
  actions,
  className,
  companies = [],
  controlNumber,
  countries = [],
  effectiveDate,
  sourceName,
  status,
  summary,
  technologies = [],
  title,
  ...props
}: PolicyCardProps) {
  return (
    <article
      className={cn('rounded-md border border-slate-200 bg-white p-4 shadow-sm', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            {sourceName ? (
              <span className="inline-flex items-center gap-1.5">
                <Landmark aria-hidden="true" size={15} strokeWidth={2} />
                {sourceName}
              </span>
            ) : null}
            {effectiveDate ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" size={15} strokeWidth={2} />
                {effectiveDate}
              </span>
            ) : null}
            {controlNumber ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <FileText aria-hidden="true" size={15} strokeWidth={2} />
                {controlNumber}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>
          {actions}
        </div>
      </div>

      {summary ? <p className="mt-3 text-sm leading-6 text-slate-600">{summary}</p> : null}

      <div className="mt-4 grid gap-2">
        <DetailList items={technologies} />
        <DetailList items={[...companies, ...countries]} />
      </div>
    </article>
  );
}
