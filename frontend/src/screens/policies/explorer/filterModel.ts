import type { PolicyFilters as FilterPanelPolicyFilters } from '@/components/molecules';
import type { PolicyFilters as StorePolicyFilters } from '@/store';

const activeFilterLabels = {
  company: 'Company',
  country: 'Country',
  q: 'Search',
  restriction: 'Restriction',
  source: 'Source',
  technology: 'Technology',
  title: 'Title',
  year: 'Year',
} satisfies Record<keyof StorePolicyFilters, string>;

export const toPanelFilters = (filters: StorePolicyFilters): FilterPanelPolicyFilters => ({
  company: filters.company,
  country: filters.country,
  restriction: filters.restriction,
  source: filters.source,
  technology: filters.technology,
  year: filters.year ? String(filters.year) : undefined,
});

export const toSearchFilters = (filters: FilterPanelPolicyFilters): Partial<StorePolicyFilters> => {
  const year = filters.year ? Number(filters.year) : undefined;

  return {
    company: filters.company,
    country: filters.country,
    restriction: filters.restriction,
    source: filters.source,
    technology: filters.technology,
    year: year && Number.isFinite(year) ? year : undefined,
  };
};

export const getActiveFilterEntries = (filters: StorePolicyFilters) =>
  (Object.entries(filters) as Array<[keyof StorePolicyFilters, StorePolicyFilters[keyof StorePolicyFilters]]>)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => ({
      key,
      label: activeFilterLabels[key],
      value: String(value),
    }));
