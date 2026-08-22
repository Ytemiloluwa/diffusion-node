import { Badge, CountryFlag } from '@/components/atoms';
import { DataTable, type DataTableColumn } from '@/components/organisms';
import type { Policy } from '@/lib/api';
import {
  formatCount,
  formatDate,
  getPolicyCountries,
  getPolicySourceName,
  getPolicyTechnologyNames,
  policyStatusLabels,
  policyStatusTones,
} from '@/screens/shared';
import { DASHBOARD_PAGE_LIMIT } from '../constants';

const policyColumns: DataTableColumn<Policy>[] = [
  {
    cell: (policy) => (
      <div>
        <p className="font-semibold text-ink">{policy.title}</p>
        <p className="mt-1 text-xs text-muted">{getPolicySourceName(policy)}</p>
      </div>
    ),
    header: 'Policy',
    id: 'policy',
    isRowHeader: true,
    sortValue: (policy) => policy.title,
    width: '32%',
  },
  {
    cell: (policy) => {
      const technologies = getPolicyTechnologyNames(policy);
      return technologies.length ? technologies.slice(0, 3).join(', ') : 'No linked technologies';
    },
    header: 'Technologies',
    id: 'technologies',
    sortValue: (policy) => getPolicyTechnologyNames(policy).join(', '),
    width: '24%',
  },
  {
    align: 'right',
    cell: (policy) => formatCount(policy.companies.length),
    header: 'Companies',
    id: 'companies',
    sortValue: (policy) => policy.companies.length,
    width: '11%',
  },
  {
    cell: (policy) => {
      const countries = getPolicyCountries(policy);

      return countries.length ? (
        <div className="flex flex-wrap gap-1.5">
          {countries.slice(0, 2).map((country) => (
            <span className="inline-flex items-center gap-1.5" key={country.id}>
              <CountryFlag
                className="h-3.5 w-5"
                countryCode={country.isoCode}
                countryName={country.name}
              />
              <span>{country.name}</span>
            </span>
          ))}
          {countries.length > 2 ? <Badge tone="slate">+{formatCount(countries.length - 2)}</Badge> : null}
        </div>
      ) : (
        'No country links'
      );
    },
    header: 'Countries',
    id: 'countries',
    sortValue: (policy) => getPolicyCountries(policy).length,
    width: '15%',
  },
  {
    cell: (policy) => (
      <Badge tone={policyStatusTones[policy.status]}>{policyStatusLabels[policy.status]}</Badge>
    ),
    header: 'Status',
    id: 'status',
    sortValue: (policy) => policyStatusLabels[policy.status],
    width: '9%',
  },
  {
    cell: (policy) => formatDate(policy.effectiveDate),
    header: 'Effective',
    id: 'effectiveDate',
    sortValue: (policy) => policy.effectiveDate,
    width: '9%',
  },
];

type DashboardPolicyTableProps = {
  hasMorePolicies: boolean;
  isLoading: boolean;
  policies: Policy[];
};

export function DashboardPolicyTable({
  hasMorePolicies,
  isLoading,
  policies,
}: DashboardPolicyTableProps) {
  return (
    <DataTable
      actions={
        <Badge tone={hasMorePolicies ? 'amber' : 'slate'}>
          {hasMorePolicies ? `First ${DASHBOARD_PAGE_LIMIT} records` : `${formatCount(policies.length)} records`}
        </Badge>
      }
      className="mt-5"
      columns={policyColumns}
      description="Curated policy records with linked companies, technologies, and jurisdictions."
      emptyState="No policy records found."
      isLoading={isLoading}
      rowKey={(policy) => policy.id}
      rows={policies.slice(0, 8)}
      title="Policy Records"
    />
  );
}
