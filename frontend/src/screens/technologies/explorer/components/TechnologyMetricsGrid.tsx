import { TechnologyMetricCard } from './TechnologyMetricCard';
import type { TechnologyExplorerMetric } from '../types';

type TechnologyMetricsGridProps = {
  isLoading: boolean;
  metrics: TechnologyExplorerMetric[];
};

export function TechnologyMetricsGrid({ isLoading, metrics }: TechnologyMetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {isLoading
        ? Array.from({ length: 4 }, (_, index) => (
            <section
              aria-hidden="true"
              className="rounded-panel border border-line bg-surface p-4 shadow-panel"
              key={index}
            >
              <div className="h-4 w-28 rounded-control bg-line" />
              <div className="mt-4 h-8 w-16 rounded-control bg-line" />
              <div className="mt-4 h-4 w-40 rounded-control bg-line" />
            </section>
          ))
        : metrics.map((metric) => <TechnologyMetricCard key={metric.label} {...metric} />)}
    </div>
  );
}
