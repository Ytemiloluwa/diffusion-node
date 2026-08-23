import { RotateCcw } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import type { CompanyFilters } from '@/store';

type FilterOption = {
  label: string;
  value: string;
};

type CompanyFiltersPanelProps = {
  activeFilterCount: number;
  countryOptions: FilterOption[];
  draftFilters: CompanyFilters;
  isLoading: boolean;
  onApplyFilters: () => void;
  onChangeDraftFilter: (key: keyof CompanyFilters, value: string) => void;
  onResetFilters: () => void;
  searchQuery: string;
  statusOptions: FilterOption[];
};

const selectClassName =
  'h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft';

export function CompanyFiltersPanel({
  activeFilterCount,
  countryOptions,
  draftFilters,
  isLoading,
  onApplyFilters,
  onChangeDraftFilter,
  onResetFilters,
  searchQuery,
  statusOptions,
}: CompanyFiltersPanelProps) {
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
      description="Refine company records by headquarters country and list status."
      title="Filters"
    >
      <div className="grid min-w-0 gap-4">
        <label className="grid min-w-0 gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Country</span>
          <select
            className={selectClassName}
            disabled={isLoading}
            onChange={(event) => onChangeDraftFilter('country', event.target.value)}
            value={draftFilters.country ?? ''}
          >
            <option value="">All</option>
            {countryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className="text-sm font-medium text-ink-soft">List status</span>
          <select
            className={selectClassName}
            disabled={isLoading}
            onChange={(event) => onChangeDraftFilter('entityListStatus', event.target.value)}
            value={draftFilters.entityListStatus ?? ''}
          >
            <option value="">All</option>
            {statusOptions.map((option) => (
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
