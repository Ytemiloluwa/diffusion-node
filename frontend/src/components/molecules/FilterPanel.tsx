'use client';

import { RotateCcw } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button, Panel } from '@/components/atoms';

export type FilterOption = {
  label: string;
  value: string;
};

export type PolicyFilters = {
  company?: string;
  country?: string;
  restriction?: string;
  source?: string;
  status?: string;
  technology?: string;
  year?: string;
};

type FilterKey = keyof PolicyFilters;

const defaultFilterFields: Array<{
  key: FilterKey;
  label: string;
}> = [
  { key: 'technology', label: 'Technology' },
  { key: 'company', label: 'Company' },
  { key: 'country', label: 'Country' },
  { key: 'source', label: 'Source' },
  { key: 'restriction', label: 'Restriction' },
  { key: 'status', label: 'Status' },
  { key: 'year', label: 'Year' },
];

export type FilterPanelProps = {
  fields?: FilterKey[];
  filters: PolicyFilters;
  isDisabled?: boolean;
  onApply?: (filters: PolicyFilters) => void;
  onChange: (filters: PolicyFilters) => void;
  onReset?: () => void;
  options?: Partial<Record<FilterKey, FilterOption[]>>;
};

export function FilterPanel({
  fields,
  filters,
  isDisabled = false,
  onApply,
  onChange,
  onReset,
  options = {},
}: FilterPanelProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const visibleFields = fields
    ? defaultFilterFields.filter((field) => fields.includes(field.key))
    : defaultFilterFields;

  const updateFilter = (key: FilterKey, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply?.(filters);
  };

  return (
    <Panel
      actions={
        <Button
          disabled={isDisabled || !hasActiveFilters}
          leadingIcon={<RotateCcw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={onReset}
          size="sm"
          variant="ghost"
        >
          Reset
        </Button>
      }
      description="Refine policies by their linked entities and source metadata."
      title="Filters"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleFields.map((field) => (
            <label className="grid gap-1.5" key={field.key}>
              <span className="text-sm font-medium text-ink-soft">{field.label}</span>
              <select
                className="h-10 rounded-control border border-line-strong bg-surface px-3 text-sm text-ink shadow-control transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus-soft"
                disabled={isDisabled}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  updateFilter(field.key, event.target.value)
                }
                value={filters[field.key] ?? ''}
              >
                <option value="">All</option>
                {(options[field.key] ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {onApply ? (
          <div className="flex justify-end">
            <Button disabled={isDisabled} size="sm" type="submit">
              Apply filters
            </Button>
          </div>
        ) : null}
      </form>
    </Panel>
  );
}
