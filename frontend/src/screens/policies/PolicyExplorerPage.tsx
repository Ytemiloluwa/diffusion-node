'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import { getDisplayName, getInitials } from '@/screens/shared';
import {
  PolicyCardList,
  PolicyExplorerSidebar,
  PolicyResultsTable,
  PolicySearchPanel,
} from './explorer/components';
import { usePolicyExplorerData } from './explorer/hooks/usePolicyExplorerData';

export type PolicyExplorerPageProps = {
  initialSearch?: string;
};

export function PolicyExplorerPage({ initialSearch }: PolicyExplorerPageProps) {
  const {
    activeFilters,
    applyFilters,
    applySearch,
    cursorStack,
    draftFilters,
    error,
    filterOptions,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    linkedEntityCounts,
    options,
    pageInfo,
    policies,
    refresh,
    resetFilters,
    searchValue,
    setDraftFilters,
    setSearchValue,
    statusCounts,
    user,
  } = usePolicyExplorerData(initialSearch);

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
      activeItem="policy-explorer"
      description="Search policy records by source metadata, affected technologies, companies, jurisdictions, and effective year."
      eyebrow="Policy explorer"
      title="Policy Explorer"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Policy records unavailable">
          <div className="flex gap-3 text-sm text-danger">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <PolicySearchPanel
            activeFilters={activeFilters}
            isLoading={isLoading}
            onSearch={applySearch}
            onSearchValueChange={setSearchValue}
            pageInfo={pageInfo}
            policyCount={policies.length}
            searchValue={searchValue}
          />

          <PolicyResultsTable
            cursorStack={cursorStack}
            isLoading={isLoading}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            pageInfo={pageInfo}
            policies={policies}
          />

          <PolicyCardList isLoading={isLoading} policies={policies} />
        </div>

        <PolicyExplorerSidebar
          activeFilters={activeFilters}
          draftFilters={draftFilters}
          filterOptions={filterOptions}
          isLoading={isLoading}
          linkedEntityCounts={linkedEntityCounts}
          onApplyFilters={applyFilters}
          onChangeDraftFilters={setDraftFilters}
          onResetFilters={resetFilters}
          options={options}
          policies={policies}
          statusCounts={statusCounts}
        />
      </div>
    </DashboardShell>
  );
}
