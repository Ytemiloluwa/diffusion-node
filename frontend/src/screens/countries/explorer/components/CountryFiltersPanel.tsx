import { RotateCcw } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import type { CountryFilterState } from '../types';

type FilterOption = {
  label: string;
  value: string;
};

type CountryFiltersPanelProps = {
  activeFilterCount: number;
  draftFilters: CountryFilterState;
  isLoading: boolean;
  onApplyFilters: () => void;
  onChangeDraftFilter: (key: keyof CountryFilterState, value: string) => void;
  onResetFilters: () => void;
  restrictionOptions: FilterOption[];
  searchQuery: string;
  tierOptions: FilterOption[];
};

export function CountryFiltersPanel({
  activeFilterCount,
  draftFilters,
  isLoading,
  onApplyFilters,
  onChangeDraftFilter,
  onResetFilters,
  restrictionOptions,
  searchQuery,
  tierOptions,
}: CountryFiltersPanelProps) {
  return (
    <Panel
      actions={
        <Button
          disabled={isLoading || (activeFilterCount === 0 && !searchQuery)}
          leadingIcon={<RotateCcw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={onResetFilters}
          size="sm"
          variant="ghost"
        >
          Reset
        </Button>
      }
      description="Refine countries by export-control tier and restriction type."
      title="Filters"
    >
      <div className="grid min-w-0 gap-4">
        <label className="grid min-w-0 gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Tier</span>
          <select
            className="h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
            disabled={isLoading}
            onChange={(event) => onChangeDraftFilter('tier', event.target.value)}
            value={draftFilters.tier ?? ''}
          >
            <option value="">All</option>
            {tierOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Restriction</span>
          <select
            className="h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
            disabled={isLoading}
            onChange={(event) => onChangeDraftFilter('restriction', event.target.value)}
            value={draftFilters.restriction ?? ''}
          >
            <option value="">All</option>
            {restrictionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end">
          <Button disabled={isLoading} onClick={onApplyFilters} size="sm">
            Apply filters
          </Button>
        </div>
      </div>
    </Panel>
  );
}
