import { describe, expect, it } from '@jest/globals';
import { resolveAlpha2CountryCode } from '../frontend/src/lib/countryCodes';

describe('country code normalization', () => {
  it.each([
    ['RUS', 'Russia', 'RU'],
    ['DEU', 'Germany', 'DE'],
    ['CAN', 'Canada', 'CA'],
    ['KGZ', 'Kyrgyzstan', 'KG'],
    ['USA', 'United States', 'US'],
    ['ARE', 'United Arab Emirates', 'AE'],
  ])('resolves ISO-3 code %s to alpha-2 code %s', (countryCode, countryName, expectedCode) => {
    expect(resolveAlpha2CountryCode(countryCode, countryName)).toBe(expectedCode);
  });

  it.each([
    ['Russia', 'RU'],
    ['Germany', 'DE'],
    ['Canada', 'CA'],
    ['United States of America', 'US'],
    ['Macau', 'MO'],
  ])('falls back to country name %s when code is unavailable', (countryName, expectedCode) => {
    expect(resolveAlpha2CountryCode('unknown', countryName)).toBe(expectedCode);
  });
});
