import { RotateCcw } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import type { TechnologyFilters } from '@/store';

type FilterOption = {
  label: string;
  value: string;
};

type TechnologyFiltersPanelProps = {
  activeFilterCount: number;
  categoryOptions: FilterOption[];
  draftFilters: TechnologyFilters;
  isLoading: boolean;
  onApplyFilters: () => void;
  onChangeDraftFilter: (key: keyof TechnologyFilters, value: string) => void;
  onResetFilters: () => void;
  searchQuery: string;
};

const selectClassName =
  'h-10 w-full min-w-0 max-w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft';

export function TechnologyFiltersPanel({
  activeFilterCount,
  categoryOptions,
  draftFilters,
  isLoading,
  onApplyFilters,
  onChangeDraftFilter,
  onResetFilters,
  searchQuery,
}: TechnologyFiltersPanelProps) {
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
      description="Refine technology records by category."
      title="Filters"
    >
      <div className="grid min-w-0 gap-4">
        <label className="grid min-w-0 gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Category</span>
          <select
            className={selectClassName}
            disabled={isLoading}
            onChange={(event) => onChangeDraftFilter('category', event.target.value)}
            value={draftFilters.category ?? ''}
          >
            <option value="">All</option>
            {categoryOptions.map((option) => (
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
