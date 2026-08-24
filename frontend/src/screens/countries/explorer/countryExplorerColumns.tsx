import { Badge } from '@/components/atoms';
import type { DataTableColumn } from '@/components/organisms';
import {
  formatCount,
  formatDate,
} from '@/screens/shared';
import { CountryLabel } from './components/CountryLabel';
import { getTierTone } from './countryModel';
import type { CountryExposure } from './types';

export const getCountryExplorerColumns = (): DataTableColumn<CountryExposure>[] => [
  {
    cell: (country) => (
      <div>
        <p className="font-semibold text-ink">
          <CountryLabel country={country} />
        </p>
        <p className="mt-1 text-xs text-muted">{country.isoCode}</p>
      </div>
    ),
    header: 'Country',
    id: 'country',
    isRowHeader: true,
    sortValue: (country) => country.name,
    width: '24%',
  },
  {
    cell: (country) => (
      <Badge tone={getTierTone(country.tierClassification)}>
        {country.tierClassification ?? 'Unclassified'}
      </Badge>
    ),
    header: 'Tier',
    id: 'tier',
    sortValue: (country) => country.tierClassification,
    width: '14%',
  },
  {
    align: 'right',
    cell: (country) => formatCount(country.restrictionCount),
    header: 'Restrictions',
    id: 'restrictions',
    sortValue: (country) => country.restrictionCount,
    width: '12%',
  },
  {
    align: 'right',
    cell: (country) => formatCount(country.activePolicyCount),
    header: 'Active Policies',
    id: 'activePolicies',
    sortValue: (country) => country.activePolicyCount,
    width: '14%',
  },
  {
    align: 'right',
    cell: (country) => formatCount(country.companyCount),
    header: 'Companies',
    id: 'companies',
    sortValue: (country) => country.companyCount,
    width: '12%',
  },
  {
    align: 'right',
    cell: (country) => formatCount(country.technologyCount),
    header: 'Technologies',
    id: 'technologies',
    sortValue: (country) => country.technologyCount,
    width: '12%',
  },
  {
    cell: (country) => formatDate(country.latestPolicyDate),
    header: 'Latest Policy',
    id: 'latestPolicy',
    sortValue: (country) => country.latestPolicyDate,
    width: '12%',
  },
];
