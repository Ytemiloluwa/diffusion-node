import Link from 'next/link';
import { Badge } from '@/components/atoms';
import type { DataTableColumn } from '@/components/organisms';
import type { Technology } from '@/lib/api';
import { formatCount, formatDate } from '@/screens/shared';
import { getCategoryTone } from './technologyModel';
import { TechnologyCountryPill } from './components/TechnologyCountryPill';
import type { TechnologyStats } from './types';

type TechnologyExplorerColumnsArgs = {
  policyStats: Map<string, TechnologyStats>;
  viewTechnologyPolicies: (technology: Technology) => void;
};

export const getTechnologyExplorerColumns = ({
  policyStats,
  viewTechnologyPolicies,
}: TechnologyExplorerColumnsArgs): DataTableColumn<Technology>[] => [
  {
    cell: (technology) => (
      <div>
        <p className="font-semibold text-ink">{technology.name}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
          {technology.description ?? 'No description provided'}
        </p>
      </div>
    ),
    header: 'Technology',
    id: 'technology',
    isRowHeader: true,
    sortValue: (technology) => technology.name,
    width: '30%',
  },
  {
    cell: (technology) => (
      <Badge tone={getCategoryTone(technology.category)}>{technology.category.name}</Badge>
    ),
    header: 'Category',
    id: 'category',
    sortValue: (technology) => technology.category.name,
    width: '16%',
  },
  {
    align: 'right',
    cell: (technology) => formatCount(policyStats.get(technology.id)?.policyCount ?? 0),
    header: 'Policies',
    id: 'policies',
    sortValue: (technology) => policyStats.get(technology.id)?.policyCount ?? 0,
    width: '10%',
  },
  {
    align: 'right',
    cell: (technology) => formatCount(policyStats.get(technology.id)?.activePolicyCount ?? 0),
    header: 'Active',
    id: 'activePolicies',
    sortValue: (technology) => policyStats.get(technology.id)?.activePolicyCount ?? 0,
    width: '10%',
  },
  {
    align: 'right',
    cell: (technology) => formatCount(policyStats.get(technology.id)?.companies.size ?? 0),
    header: 'Companies',
    id: 'companies',
    sortValue: (technology) => policyStats.get(technology.id)?.companies.size ?? 0,
    width: '10%',
  },
  {
    cell: (technology) => {
      const countries = [...(policyStats.get(technology.id)?.countries.values() ?? [])].slice(0, 2);
      const hiddenCount = (policyStats.get(technology.id)?.countries.size ?? 0) - countries.length;

      return countries.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {countries.map((country) => (
            <TechnologyCountryPill country={country} key={`${technology.id}-${country.isoCode}`} />
          ))}
          {hiddenCount > 0 ? <Badge tone="slate">+{formatCount(hiddenCount)}</Badge> : null}
        </div>
      ) : (
        <span className="text-muted">None</span>
      );
    },
    header: 'Countries',
    id: 'countries',
    sortValue: (technology) => policyStats.get(technology.id)?.countries.size ?? 0,
    width: '16%',
  },
  {
    cell: (technology) => formatDate(policyStats.get(technology.id)?.latestPolicyDate),
    header: 'Latest Policy',
    id: 'latestPolicy',
    sortValue: (technology) => policyStats.get(technology.id)?.latestPolicyDate,
    width: '12%',
  },
  {
    cell: (technology) => (
      <Link
        className="font-medium text-brand hover:text-brand-hover"
        href="/policies"
        onClick={() => viewTechnologyPolicies(technology)}
      >
        Policies
      </Link>
    ),
    header: 'Link',
    id: 'link',
    width: '6%',
  },
];
