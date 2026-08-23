import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Badge, CountryFlag } from '@/components/atoms';
import type { DataTableColumn } from '@/components/organisms';
import type { Policy } from '@/lib/api';
import {
  formatCount,
  formatDate,
  getPolicyCountries,
  getPolicySource,
  getPolicySourceName,
  getPolicyTechnologyNames,
  policyStatusLabels,
  policyStatusTones,
} from '@/screens/shared';

export const policyExplorerColumns: DataTableColumn<Policy>[] = [
  {
    cell: (policy) => (
      <div>
        <Link className="font-semibold text-ink hover:text-brand" href={`/policies/${policy.id}`}>
          {policy.title}
        </Link>
        <p className="mt-1 text-xs text-muted">{getPolicySourceName(policy)}</p>
      </div>
    ),
    header: 'Policy',
    id: 'policy',
    isRowHeader: true,
    sortValue: (policy) => policy.title,
    width: '30%',
  },
  {
    cell: (policy) => {
      const technologies = getPolicyTechnologyNames(policy);
      return technologies.length ? technologies.slice(0, 3).join(', ') : 'No technology links';
    },
    header: 'Technologies',
    id: 'technologies',
    sortValue: (policy) => getPolicyTechnologyNames(policy).join(', '),
    width: '22%',
  },
  {
    align: 'right',
    cell: (policy) => formatCount(policy.companies.length),
    header: 'Companies',
    id: 'companies',
    sortValue: (policy) => policy.companies.length,
    width: '10%',
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
    width: '14%',
  },
  {
    cell: (policy) => (
      <Badge tone={policyStatusTones[policy.status]}>{policyStatusLabels[policy.status]}</Badge>
    ),
    header: 'Status',
    id: 'status',
    sortValue: (policy) => policyStatusLabels[policy.status],
    width: '10%',
  },
  {
    cell: (policy) => formatDate(policy.effectiveDate),
    header: 'Effective',
    id: 'effectiveDate',
    sortValue: (policy) => policy.effectiveDate,
    width: '10%',
  },
  {
    cell: (policy) => {
      const source = getPolicySource(policy);

      return source?.sourceUrl ? (
        <a
          className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand-hover"
          href={source.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          Source
          <ExternalLink aria-hidden="true" size={13} strokeWidth={2} />
        </a>
      ) : (
        <span className="text-subtle">None</span>
      );
    },
    header: 'Link',
    id: 'link',
    width: '4%',
  },
];
