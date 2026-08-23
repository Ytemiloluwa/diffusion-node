import { CountryFlag } from '@/components/atoms';
import type { Company } from '@/lib/api';

export function CountryLabel({ country }: { country: Company['hqCountry'] }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CountryFlag countryCode={country.isoCode} countryName={country.name} />
      <span>{country.name}</span>
    </span>
  );
}

export function CountrySummaryLabel({ isoCode, name }: { isoCode: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <CountryFlag countryCode={isoCode} countryName={name} />
      <span>{name}</span>
    </span>
  );
}

export function CountryPill({ isoCode, name }: { isoCode: string; name: string }) {
  return (
    <span className="inline-flex min-h-6 items-center gap-1.5 rounded-control bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-soft ring-1 ring-inset ring-line">
      <CountryFlag className="h-3.5 w-5" countryCode={isoCode} countryName={name} />
      <span>{name}</span>
    </span>
  );
}
