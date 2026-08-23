import { Badge, Panel } from '@/components/atoms';
import { SearchBar } from '@/components/molecules';
import type { PolicyStatus } from '@/lib/api';
import { policyStatusLabels, policyStatusTones } from '@/screens/shared';
import { formatEventType } from '../timelineModel';
import type { TimelineFilters } from '../types';

type TimelineSearchPanelProps = {
  activeFilterCount: number;
  filters: TimelineFilters;
  onSearchChange: (value: string) => void;
  onSearchCommit: (value: string) => void;
  searchDraft: string;
  searchQuery: string;
};

export function TimelineSearchPanel({
  activeFilterCount,
  filters,
  onSearchChange,
  onSearchCommit,
  searchDraft,
  searchQuery,
}: TimelineSearchPanelProps) {
  return (
    <Panel
      actions={<Badge tone="slate">{activeFilterCount} active</Badge>}
      description="Search policy events in the current timeline page."
      title="Search Timeline"
    >
      <SearchBar
        onClear={() => onSearchCommit('')}
        onDebouncedChange={(value) => onSearchCommit(value.trim())}
        onSearch={(value) => onSearchCommit(value.trim())}
        onValueChange={onSearchChange}
        placeholder="Search event type, policy, control number, source, or status"
        value={searchDraft}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {searchQuery ? <Badge tone="sky">Search: {searchQuery}</Badge> : null}
        {filters.eventType ? <Badge tone="amber">Event: {formatEventType(filters.eventType)}</Badge> : null}
        {filters.sourceName ? <Badge tone="slate">Source: {filters.sourceName}</Badge> : null}
        {filters.status ? (
          <Badge tone={policyStatusTones[filters.status as PolicyStatus] ?? 'slate'}>
            Status: {policyStatusLabels[filters.status as PolicyStatus] ?? filters.status}
          </Badge>
        ) : null}
        {!activeFilterCount ? <span className="text-sm text-muted">No active filters</span> : null}
      </div>
    </Panel>
  );
}
