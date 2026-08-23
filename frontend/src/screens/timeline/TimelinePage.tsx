'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Badge, Button, Panel } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import { formatCount, getDisplayName, getInitials } from '@/screens/shared';
import {
  TimelineFeedPanel,
  TimelineMetricCard,
  TimelineRecordList,
  TimelineSearchPanel,
  TimelineSidebar,
} from './components';
import { useTimelineData } from './hooks/useTimelineData';

export function TimelinePage() {
  const {
    activeFilterCount,
    applyFilters,
    cursorStack,
    draftFilters,
    error,
    eventTypeOptions,
    filteredTimeline,
    filters,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    linkedPolicies,
    metrics,
    pageInfo,
    pageNumber,
    refresh,
    resetFilters,
    searchDraft,
    searchQuery,
    setDraftFilters,
    setSearchDraft,
    setSearchQuery,
    sourceCounts,
    sourceOptions,
    statusCounts,
    statusOptions,
    timelineFeedItems,
    user,
  } = useTimelineData();

  return (
    <DashboardShell
      actions={
        <Button
          isLoading={isLoading}
          leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={() => void refresh()}
          variant="secondary"
        >
          Refresh
        </Button>
      }
      activeItem="timeline"
      description="Track export-control milestones, rule changes, source citations, and linked policy records in one chronological view."
      eyebrow="Policy timeline"
      title="Timeline"
      userInitials={getInitials(user?.email ?? null)}
      userName={getDisplayName(user?.email ?? null)}
    >
      {error ? (
        <Panel className="border-danger-line bg-danger-soft" title="Timeline data unavailable">
          <div className="flex items-start gap-3 text-sm text-danger">
            <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <TimelineMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <TimelineSearchPanel
            activeFilterCount={activeFilterCount}
            filters={filters}
            onSearchChange={setSearchDraft}
            onSearchCommit={setSearchQuery}
            searchDraft={searchDraft}
            searchQuery={searchQuery}
          />

          <TimelineFeedPanel
            hasPreviousPage={cursorStack.length > 0}
            isLoading={isLoading}
            items={timelineFeedItems}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            pageInfo={pageInfo}
            pageNumber={pageNumber}
          />

          <Panel
            actions={<Badge tone="slate">{formatCount(filteredTimeline.length)} shown</Badge>}
            description="Readable event records for the current timeline page."
            title="Event Records"
          >
            <TimelineRecordList events={filteredTimeline} isLoading={isLoading} />
          </Panel>
        </div>

        <TimelineSidebar
          draftFilters={draftFilters}
          eventTypeOptions={eventTypeOptions}
          linkedPolicies={linkedPolicies}
          onApplyFilters={applyFilters}
          onChangeDraftFilters={setDraftFilters}
          onResetFilters={resetFilters}
          sourceCounts={sourceCounts}
          sourceOptions={sourceOptions}
          statusCounts={statusCounts}
          statusOptions={statusOptions}
        />
      </section>
    </DashboardShell>
  );
}
