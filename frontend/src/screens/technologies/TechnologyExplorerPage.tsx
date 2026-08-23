'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import { getDisplayName, getInitials } from '@/screens/shared';
import {
  TechnologyCardList,
  TechnologyMetricsGrid,
  TechnologyResultsTable,
  TechnologySearchPanel,
  TechnologySidebar,
} from './explorer/components';
import { useTechnologyExplorerData } from './explorer/hooks/useTechnologyExplorerData';

export function TechnologyExplorerPage() {
  const {
    activeFilterCount,
    applyFilters,
    categories,
    categoryDistribution,
    categoryOptions,
    clearSearch,
    cursorStack,
    draftFilters,
    error,
    filteredTechnologies,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    metrics,
    pageInfo,
    policyStats,
    refresh,
    resetFilters,
    searchDraft,
    searchQuery,
    setSearchDraft,
    setSearchQuery,
    statusCounts,
    technologyColumns,
    technologyFilters,
    topTechnologies,
    updateDraftFilter,
    user,
    viewTechnologyPolicies,
  } = useTechnologyExplorerData();

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
      activeItem="technology-explorer"
      description="Analyze controlled semiconductor and AI technologies, their categories, policy coverage, companies, and exposed jurisdictions."
      eyebrow="Technology explorer"
      title="Technology Explorer"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Technology records unavailable">
          <div className="flex gap-3 text-sm text-danger">
            <ShieldAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={2}
            />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <TechnologyMetricsGrid isLoading={isLoading} metrics={metrics} />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <TechnologySearchPanel
            hasNextPage={pageInfo.hasNextPage}
            isLoading={isLoading}
            onClearSearch={clearSearch}
            onSearchChange={setSearchDraft}
            onSearchCommit={setSearchQuery}
            searchDraft={searchDraft}
            searchQuery={searchQuery}
            technologyCount={filteredTechnologies.length}
            technologyFilters={technologyFilters}
          />
          <TechnologyResultsTable
            columns={technologyColumns}
            cursorStack={cursorStack}
            isLoading={isLoading}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            pageInfo={pageInfo}
            rows={filteredTechnologies}
          />
          <TechnologyCardList
            isLoading={isLoading}
            onViewPolicies={viewTechnologyPolicies}
            policyStats={policyStats}
            technologies={filteredTechnologies}
          />
        </div>

        <TechnologySidebar
          activeFilterCount={activeFilterCount}
          categories={categories}
          categoryDistribution={categoryDistribution}
          categoryOptions={categoryOptions}
          draftFilters={draftFilters}
          isLoading={isLoading}
          onApplyFilters={applyFilters}
          onChangeDraftFilter={updateDraftFilter}
          onResetFilters={resetFilters}
          searchQuery={searchQuery}
          statusCounts={statusCounts}
          topTechnologies={topTechnologies}
        />
      </div>
    </DashboardShell>
  );
}
