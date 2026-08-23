import { useMemo } from 'react';
import { Badge, CountryFlag, Panel, Spinner } from '@/components/atoms';
import type { CountryWithRestrictionSummary } from '@/lib/api';
import { formatCount, getRestrictionCount } from '@/screens/shared';

type CountryExposurePanelProps = {
  countries: CountryWithRestrictionSummary[];
  isLoading: boolean;
};

export function CountryExposurePanel({ countries, isLoading }: CountryExposurePanelProps) {
  const topCountries = useMemo(
    () =>
      [...countries]
        .map((country) => ({ country, restrictionCount: getRestrictionCount(country) }))
        .filter(({ restrictionCount }) => restrictionCount > 0)
        .sort((left, right) => right.restrictionCount - left.restrictionCount)
        .slice(0, 5),
    [countries],
  );

  return (
    <Panel
      actions={<Badge tone="slate">{formatCount(topCountries.length)} shown</Badge>}
      description="Countries ranked by linked restriction records."
      title="Country Exposure"
    >
      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-muted">
          <Spinner label="Loading countries" />
          <span>Loading countries</span>
        </div>
      ) : topCountries.length ? (
        <div className="space-y-3">
          {topCountries.map(({ country, restrictionCount }) => (
            <div className="flex items-center justify-between gap-3" key={country.id}>
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <CountryFlag countryCode={country.isoCode} countryName={country.name} />
                  <span>{country.name}</span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  {country.tierClassification ?? country.isoCode}
                </p>
              </div>
              <Badge tone="amber">{formatCount(restrictionCount)} links</Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No linked country restrictions returned.</p>
      )}
    </Panel>
  );
}
