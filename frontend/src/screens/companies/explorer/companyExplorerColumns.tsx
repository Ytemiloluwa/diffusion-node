import Link from 'next/link';
import { Badge } from '@/components/atoms';
import type { DataTableColumn } from '@/components/organisms';
import type { Company } from '@/lib/api';
import { formatCount, formatDate } from '@/screens/shared';
import { getEntityStatusTone } from './companyModel';
import { CountryLabel } from './components/CompanyCountryLabels';
import type { CompanyStats } from './types';

type CompanyExplorerColumnsArgs = {
  policyStats: Map<string, CompanyStats>;
  viewCompanyPolicies: (company: Company) => void;
};

export const getCompanyExplorerColumns = ({
  policyStats,
  viewCompanyPolicies,
}: CompanyExplorerColumnsArgs): DataTableColumn<Company>[] => [
  {
    cell: (company) => (
      <div>
        <p className="font-semibold text-ink">{company.name}</p>
        {company.aliases.length ? (
          <p className="mt-1 text-xs text-muted">{company.aliases.slice(0, 2).join(', ')}</p>
        ) : (
          <p className="mt-1 text-xs text-muted">No aliases listed</p>
        )}
      </div>
    ),
    header: 'Company',
    id: 'company',
    isRowHeader: true,
    sortValue: (company) => company.name,
    width: '28%',
  },
  {
    cell: (company) => <CountryLabel country={company.hqCountry} />,
    header: 'HQ Country',
    id: 'country',
    sortValue: (company) => company.hqCountry.name,
    width: '16%',
  },
  {
    cell: (company) => (
      <Badge tone={getEntityStatusTone(company.entityListStatus)}>
        {company.entityListStatus ?? 'Not listed'}
      </Badge>
    ),
    header: 'List Status',
    id: 'status',
    sortValue: (company) => company.entityListStatus,
    width: '16%',
  },
  {
    align: 'right',
    cell: (company) => formatCount(policyStats.get(company.id)?.policyCount ?? 0),
    header: 'Policies',
    id: 'policies',
    sortValue: (company) => policyStats.get(company.id)?.policyCount ?? 0,
    width: '10%',
  },
  {
    align: 'right',
    cell: (company) => formatCount(policyStats.get(company.id)?.technologies.size ?? 0),
    header: 'Technologies',
    id: 'technologies',
    sortValue: (company) => policyStats.get(company.id)?.technologies.size ?? 0,
    width: '12%',
  },
  {
    cell: (company) => formatDate(policyStats.get(company.id)?.latestPolicyDate),
    header: 'Latest Policy',
    id: 'latestPolicy',
    sortValue: (company) => policyStats.get(company.id)?.latestPolicyDate,
    width: '14%',
  },
  {
    cell: (company) => (
      <Link
        className="font-medium text-brand hover:text-brand-hover"
        href="/policies"
        onClick={() => viewCompanyPolicies(company)}
      >
        Policies
      </Link>
    ),
    header: 'Link',
    id: 'link',
    width: '4%',
  },
];
