import { Filter, RotateCcw } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import { formatEventType } from '../timelineModel';
import type { TimelineFilters } from '../types';

type TimelineFilterOption = {
  label: string;
  value: string;
};

type TimelineFiltersPanelProps = {
  draftFilters: TimelineFilters;
  eventTypeOptions: TimelineFilterOption[];
  onApplyFilters: () => void;
  onChangeDraftFilters: (filters: TimelineFilters) => void;
  onResetFilters: () => void;
  sourceOptions: TimelineFilterOption[];
  statusOptions: TimelineFilterOption[];
};

const selectClassName =
  'mt-2 block w-full min-w-0 rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-control outline-none transition focus:border-focus focus:ring-2 focus:ring-focus-soft';

export function TimelineFiltersPanel({
  draftFilters,
  eventTypeOptions,
  onApplyFilters,
  onChangeDraftFilters,
  onResetFilters,
  sourceOptions,
  statusOptions,
}: TimelineFiltersPanelProps) {
  return (
    <Panel
      actions={
        <Button
          leadingIcon={<RotateCcw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={onResetFilters}
          size="sm"
          variant="ghost"
        >
          Reset
        </Button>
      }
      description="Refine the currently loaded timeline page."
      title="Filters"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-muted">Event Type</span>
          <select
            className={selectClassName}
            onChange={(event) => onChangeDraftFilters({ ...draftFilters, eventType: event.target.value })}
            value={draftFilters.eventType}
          >
            <option value="">All</option>
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {formatEventType(option.label)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-muted">Source</span>
          <select
            className={selectClassName}
            onChange={(event) => onChangeDraftFilters({ ...draftFilters, sourceName: event.target.value })}
            value={draftFilters.sourceName}
          >
            <option value="">All</option>
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-muted">Policy Status</span>
          <select
            className={selectClassName}
            onChange={(event) => onChangeDraftFilters({ ...draftFilters, status: event.target.value })}
            value={draftFilters.status}
          >
            <option value="">All</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <Button
          className="w-full"
          leadingIcon={<Filter aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={onApplyFilters}
        >
          Apply filters
        </Button>
      </div>
    </Panel>
  );
}
