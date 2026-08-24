import * as FlagIcons from 'country-flag-icons/react/3x2';
import type { ComponentType, HTMLAttributes, SVGProps } from 'react';
import { cn } from '@/lib/cn';
import { resolveAlpha2CountryCode } from '@/lib/countryCodes';

type FlagComponent = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

export type CountryFlagProps = HTMLAttributes<HTMLSpanElement> & {
  countryCode?: string | null;
  countryName?: string | null;
};

export function CountryFlag({ className, countryCode, countryName, ...props }: CountryFlagProps) {
  const rawCode = countryCode?.trim().toUpperCase();
  const normalizedCode = resolveAlpha2CountryCode(countryCode, countryName);
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
