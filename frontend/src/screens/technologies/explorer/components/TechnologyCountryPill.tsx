import { CountryFlag } from '@/components/atoms';
import type { CountrySummary } from '../types';

type TechnologyCountryPillProps = {
  country: CountrySummary;
};

export function TechnologyCountryPill({ country }: TechnologyCountryPillProps) {
  return (
    <span className="inline-flex min-h-6 items-center gap-1.5 rounded-control bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-soft ring-1 ring-inset ring-line">
      <CountryFlag className="h-3.5 w-5" countryCode={country.isoCode} countryName={country.name} />
      <span>{country.name}</span>
    </span>
  );
}
