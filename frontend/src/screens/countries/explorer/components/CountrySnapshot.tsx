import { Badge, Button, Panel } from '@/components/atoms';
import { formatCount } from '@/screens/shared';
import { getTierTone } from '../countryModel';
import type { CountryExposure } from '../types';
import { CountryLabel } from './CountryLabel';

type CountrySnapshotProps = {
  country: CountryExposure;
  onViewCompanies: (country: CountryExposure) => void;
  onViewPolicies: (country: CountryExposure) => void;
};

export function CountrySnapshot({
  country,
  onViewCompanies,
  onViewPolicies,
}: CountrySnapshotProps) {
  return (
    <Panel
      actions={<Badge tone={getTierTone(country.tierClassification)}>{country.tierClassification ?? 'No tier'}</Badge>}
      title={country.name}
    >
      <p className="mb-4 text-sm text-muted">
        <CountryLabel country={country} />
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Active policies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(country.activePolicyCount)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Restrictions</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(country.restrictionCount)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Companies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(country.companyCount)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Technologies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(country.technologyCount)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {country.restrictionTypes.slice(0, 4).map((restriction) => (
          <Badge key={restriction} tone="slate">
            {restriction}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => onViewPolicies(country)} size="sm" variant="secondary">
          View policies
        </Button>
        <Button onClick={() => onViewCompanies(country)} size="sm" variant="ghost">
          View companies
        </Button>
      </div>
    </Panel>
  );
}
