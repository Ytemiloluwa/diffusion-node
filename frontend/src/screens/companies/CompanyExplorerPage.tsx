'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import { getDisplayName, getInitials } from '@/screens/shared';
import {
  CompanyCardList,
  CompanyMetricsGrid,
  CompanyResultsTable,
  CompanySearchPanel,
  CompanySidebar,
} from './explorer/components';
import { useCompanyExplorerData } from './explorer/hooks/useCompanyExplorerData';

export function CompanyExplorerPage() {
  const {
    activeFilterCount,
    applyFilters,
    clearSearch,
    companyColumns,
    companyFilters,
    countryOptions,
    cursorStack,
    draftFilters,
    error,
    filteredCompanies,
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
    statusDistribution,
    statusOptions,
    topCountries,
    updateDraftFilter,
    user,
    viewCompanyPolicies,
  } = useCompanyExplorerData();

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
      activeItem="companies"
      description="Review companies linked to export-control records, headquarters exposure, list status, and related policy coverage."
      eyebrow="Company explorer"
      title="Companies"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Company records unavailable">
          <div className="flex gap-3 text-sm text-danger">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <CompanyMetricsGrid isLoading={isLoading} metrics={metrics} />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <CompanySearchPanel
            companyCount={filteredCompanies.length}
            companyFilters={companyFilters}
            hasNextPage={pageInfo.hasNextPage}
            isLoading={isLoading}
            onClearSearch={clearSearch}
            onSearchChange={setSearchDraft}
            onSearchCommit={setSearchQuery}
            searchDraft={searchDraft}
            searchQuery={searchQuery}
          />

          <CompanyResultsTable
            columns={companyColumns}
            cursorStack={cursorStack}
            isLoading={isLoading}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            pageInfo={pageInfo}
            rows={filteredCompanies}
          />

          <CompanyCardList
            companies={filteredCompanies}
            isLoading={isLoading}
            onViewPolicies={viewCompanyPolicies}
            policyStats={policyStats}
          />
        </div>

        <CompanySidebar
          activeFilterCount={activeFilterCount}
          companies={filteredCompanies}
          countryOptions={countryOptions}
          draftFilters={draftFilters}
          isLoading={isLoading}
          onApplyFilters={applyFilters}
          onChangeDraftFilter={updateDraftFilter}
          onResetFilters={resetFilters}
          policyStats={policyStats}
          searchQuery={searchQuery}
          statusDistribution={statusDistribution}
          statusOptions={statusOptions}
          topCountries={topCountries}
        />
      </div>
    </DashboardShell>
  );
}
