import type { PageInfo } from '@/lib/api';
import type { MapExposureMode } from '@/components/organisms';

export const COUNTRY_PAGE_SIZE = 20;
export const COUNTRY_OPTION_LIMIT = 100;
export const COUNTRY_POLICY_CONTEXT_PAGE_LIMIT = 100;
export const COUNTRY_POLICY_CONTEXT_PAGE_CAP = 5;

export const emptyCountryPageInfo: PageInfo = {
  hasNextPage: false,
  limit: COUNTRY_PAGE_SIZE,
  nextCursor: null,
};

export const countryMapModeOptions: Array<{ label: string; value: MapExposureMode }> = [
  { label: 'Active Policies', value: 'policies' },
  { label: 'Restrictions', value: 'restrictions' },
  { label: 'Tier', value: 'tier' },
];
