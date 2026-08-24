import { CountryFlag } from '@/components/atoms';
import type { CountryExposure } from '../types';

export function CountryLabel({ country }: { country: CountryExposure }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CountryFlag countryCode={country.isoCode} countryName={country.name} />
      <span>{country.name}</span>
    </span>
  );
}
