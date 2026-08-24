import {
  countries as flagCountryCodes,
  hasFlag,
} from 'country-flag-icons';

const countryDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' });

const countryCodeAliases: Record<string, string> = {
  ARE: 'AE',
  CAN: 'CA',
  CHN: 'CN',
  DEU: 'DE',
  GBR: 'GB',
  IND: 'IN',
  IRN: 'IR',
  JPN: 'JP',
  KGZ: 'KG',
  KOR: 'KR',
  MAC: 'MO',
  NLD: 'NL',
  RUS: 'RU',
  SGP: 'SG',
  TUR: 'TR',
  TWN: 'TW',
  UK: 'GB',
  USA: 'US',
};

const countryNameAliases: Record<string, string> = {
  macao: 'MO',
  'macao sar china': 'MO',
  macau: 'MO',
  russia: 'RU',
  'south korea': 'KR',
  'united states': 'US',
  'united states of america': 'US',
};

export const normalizeCountryName = (value?: string | null): string | null => {
  const normalizedName = value
    ?.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return normalizedName || null;
};

const countryCodesByName = new Map<string, string>();

const getDisplayCountryName = (countryCode: string): string | null => {
  try {
    return countryDisplayNames.of(countryCode) ?? null;
  } catch {
    return null;
  }
};

flagCountryCodes.forEach((countryCode) => {
  const displayName = normalizeCountryName(getDisplayCountryName(countryCode));

  if (displayName) {
    countryCodesByName.set(displayName, countryCode);
  }
});

Object.entries(countryNameAliases).forEach(([countryName, countryCode]) => {
  countryCodesByName.set(countryName, countryCode);
});

export const resolveAlpha2CountryCode = (
  countryCode?: string | null,
  countryName?: string | null,
): string | null => {
  const normalizedCode = countryCode?.trim().toUpperCase();

  if (normalizedCode) {
    const alias = countryCodeAliases[normalizedCode] ?? normalizedCode;

    if (hasFlag(alias)) {
      return alias;
    }
  }

  const normalizedName = normalizeCountryName(countryName);

  return normalizedName ? (countryCodesByName.get(normalizedName) ?? null) : null;
};
