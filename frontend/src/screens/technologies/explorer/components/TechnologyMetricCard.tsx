import { metricToneClasses } from '@/screens/shared';
import type { TechnologyExplorerMetric } from '../types';

export function TechnologyMetricCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: TechnologyExplorerMetric) {
  return (
    <section className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-ink">{value}</p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-control ring-1 ring-inset ${metricToneClasses[tone]}`}
        >
          <Icon aria-hidden="true" size={19} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </section>
  );
}
