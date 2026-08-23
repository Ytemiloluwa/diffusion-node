import { cn } from '@/lib/cn';
import { metricToneClasses } from '@/screens/shared';
import type { TimelineMetric } from '../types';

export function TimelineMetricCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: TimelineMetric) {
  return (
    <section className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold leading-none tracking-normal text-ink">{value}</p>
        </div>
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-control ring-1 ring-inset',
            metricToneClasses[tone],
          )}
        >
          <Icon aria-hidden="true" size={19} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </section>
  );
}
