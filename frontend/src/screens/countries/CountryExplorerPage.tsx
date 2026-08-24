'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import { getDisplayName, getInitials } from '@/screens/shared';
import {
  CountryMapPanel,
  CountryMetricsGrid,
  CountryResultsTable,
  CountrySearchPanel,
  CountrySidebar,
} from './explorer/components';
import { useCountryExplorerData } from './explorer/hooks/useCountryExplorerData';

export function CountryExplorerPage() {
  const {
    activeFilterCount,
    applyFilters,
    countryColumns,
    cursorStack,
    draftFilters,
    error,
    filteredCountries,
    filters,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    mapCountries,
    mapMode,
    metrics,
    pageInfo,
    refresh,
    resetFilters,
    restrictionOptions,
    searchDraft,
    searchQuery,
    selectedCountry,
    selectedCountryId,
    setMapMode,
    setSearchDraft,
    setSearchQuery,
    setSelectedCountryId,
    tierDistribution,
    tierOptions,
    topCountries,
    updateDraftFilter,
    user,
    viewCountryCompanies,
    viewCountryPolicies,
    clearSearch,
  } = useCountryExplorerData();

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
      activeItem="countries"
      description="Review jurisdiction exposure, policy tiers, company headquarters, and affected technology scope by country."
      eyebrow="Country explorer"
      title="Countries"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Country records unavailable">
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

      <CountryMetricsGrid isLoading={isLoading} metrics={metrics} />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <CountryMapPanel
            countries={mapCountries}
            isLoading={isLoading}
            mapMode={mapMode}
            onMapModeChange={setMapMode}
            onSelectCountry={setSelectedCountryId}
            selectedCountryId={selectedCountryId}
          />
          <CountrySearchPanel
            countryCount={filteredCountries.length}
            filters={filters}
            hasNextPage={pageInfo.hasNextPage}
            isLoading={isLoading}
            onClearSearch={clearSearch}
            onSearchChange={setSearchDraft}
            onSearchCommit={setSearchQuery}
            searchDraft={searchDraft}
            searchQuery={searchQuery}
            selectedCountry={selectedCountry}
          />
          <CountryResultsTable
            columns={countryColumns}
            cursorStack={cursorStack}
            isLoading={isLoading}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            pageInfo={pageInfo}
            rows={filteredCountries}
          />
        </div>

        <CountrySidebar
          activeFilterCount={activeFilterCount}
          draftFilters={draftFilters}
          isLoading={isLoading}
          onApplyFilters={applyFilters}
          onChangeDraftFilter={updateDraftFilter}
          onResetFilters={resetFilters}
          onSelectCountry={setSelectedCountryId}
          onViewCompanies={viewCountryCompanies}
          onViewPolicies={viewCountryPolicies}
          restrictionOptions={restrictionOptions}
          searchQuery={searchQuery}
          selectedCountry={selectedCountry}
          tierDistribution={tierDistribution}
          tierOptions={tierOptions}
          topCountries={topCountries}
        />
      </div>
    </DashboardShell>
  );
}
