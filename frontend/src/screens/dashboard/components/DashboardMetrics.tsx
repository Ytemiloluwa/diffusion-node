import { useMemo } from 'react';
import { Building2, Cpu, Database, Globe2 } from 'lucide-react';
import { formatCount, getRestrictionCount } from '@/screens/shared';
import type { DashboardData, DashboardMetric } from '../types';
import { MetricCard } from './MetricCard';

type DashboardMetricsProps = {
  data: DashboardData;
  isLoading: boolean;
};

export function DashboardMetrics({ data, isLoading }: DashboardMetricsProps) {
  const metrics = useMemo<DashboardMetric[]>(() => {
    const linkedTechnologyCount = new Set(
      data.policies.flatMap((policy) => policy.technologies.map(({ technologyId }) => technologyId)),
    ).size;
    const linkedCompanyCount = new Set(
      data.policies.flatMap((policy) => policy.companies.map(({ companyId }) => companyId)),
    ).size;
    const restrictedCountryCount = data.countries.filter((country) => getRestrictionCount(country) > 0)
      .length;

    return [
      {
        detail: data.hasMorePolicies ? 'Showing the first 100 records' : 'Loaded from policy records',
        icon: Database,
        label: 'Policies loaded',
        tone: 'slate',
        value: formatCount(data.policies.length),
      },
      {
        detail: `${formatCount(data.technologies.length)} technology records in scope`,
        icon: Cpu,
        label: 'Linked technologies',
        tone: 'sky',
        value: formatCount(linkedTechnologyCount),
      },
      {
        detail: `${formatCount(data.companies.length)} company records in scope`,
        icon: Building2,
        label: 'Linked companies',
        tone: 'emerald',
        value: formatCount(linkedCompanyCount),
      },
      {
        detail: data.hasMoreCountries ? 'Showing the first 100 countries' : 'Countries with policy links',
        icon: Globe2,
        label: 'Restricted countries',
        tone: 'amber',
        value: formatCount(restrictedCountryCount),
      },
    ];
  }, [data]);

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
        : metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
    </div>
  );
}
