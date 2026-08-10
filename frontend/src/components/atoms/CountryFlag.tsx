import { hasFlag } from 'country-flag-icons';
import * as FlagIcons from 'country-flag-icons/react/3x2';
import type { ComponentType, HTMLAttributes, SVGProps } from 'react';
import { cn } from '@/lib/cn';

type FlagComponent = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

export type CountryFlagProps = HTMLAttributes<HTMLSpanElement> & {
  countryCode?: string | null;
  countryName?: string | null;
};

const COUNTRY_CODE_ALIASES: Record<string, string> = {
  ARE: 'AE',
  CHN: 'CN',
  GBR: 'GB',
  IND: 'IN',
  IRN: 'IR',
  JPN: 'JP',
  KOR: 'KR',
  MAC: 'MO',
  NLD: 'NL',
  SGP: 'SG',
  TUR: 'TR',
  TWN: 'TW',
  UK: 'GB',
  USA: 'US',
};

const normalizeCountryCode = (countryCode?: string | null): string | null => {
  const normalizedCode = countryCode?.trim().toUpperCase();
  const flagCode = normalizedCode ? (COUNTRY_CODE_ALIASES[normalizedCode] ?? normalizedCode) : null;

  return flagCode && hasFlag(flagCode) ? flagCode : null;
};

export function CountryFlag({ className, countryCode, countryName, ...props }: CountryFlagProps) {
  const rawCode = countryCode?.trim().toUpperCase();
  const normalizedCode = normalizeCountryCode(countryCode);
  const Flag = normalizedCode
    ? (FlagIcons as Record<string, FlagComponent | undefined>)[normalizedCode]
    : undefined;
  const label = countryName ?? normalizedCode ?? rawCode ?? 'Unknown country';

  return (
    <span
      aria-label={label}
      className={cn(
        'inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-line bg-surface-muted shadow-control',
        className,
      )}
      role="img"
      title={label}
      {...props}
    >
      {Flag ? (
        <Flag aria-hidden="true" className="size-full object-cover" focusable="false" />
      ) : (
        <span aria-hidden="true" className="text-[8px] font-semibold leading-none text-muted">
          {rawCode ?? '--'}
        </span>
      )}
    </span>
  );
}
