import { Building2, FileSearch, Filter, Globe2 } from 'lucide-react';
import { Badge, Panel } from '@/components/atoms';
import { FilterPanel, type PolicyFilters as FilterPanelPolicyFilters } from '@/components/molecules';
import type { Policy } from '@/lib/api';
import {
  formatCount,
  policyStatusLabels,
  policyStatusTones,
  policyStatusValues,
} from '@/screens/shared';
import { policyExplorerFilterFields } from '../constants';
import type {
  ActivePolicyFilter,
  LinkedEntityCounts,
  PolicyExplorerOptions,
  PolicyStatusCounts,
} from '../types';

type PolicyExplorerSidebarProps = {
  activeFilters: ActivePolicyFilter[];
  draftFilters: FilterPanelPolicyFilters;
  filterOptions: Partial<Record<keyof FilterPanelPolicyFilters, Array<{ label: string; value: string }>>>;
  isLoading: boolean;
  linkedEntityCounts: LinkedEntityCounts;
  onApplyFilters: (filters: FilterPanelPolicyFilters) => void;
  onChangeDraftFilters: (filters: FilterPanelPolicyFilters) => void;
  onResetFilters: () => void;
  options: PolicyExplorerOptions;
  policies: Policy[];
  statusCounts: PolicyStatusCounts;
};

export function PolicyExplorerSidebar({
  activeFilters,
  draftFilters,
  filterOptions,
  isLoading,
  linkedEntityCounts,
  onApplyFilters,
  onChangeDraftFilters,
  onResetFilters,
  options,
  policies,
  statusCounts,
}: PolicyExplorerSidebarProps) {
  return (
    <aside className="space-y-5">
      <FilterPanel
        fields={policyExplorerFilterFields}
        filters={draftFilters}
        isDisabled={isLoading}
        onApply={onApplyFilters}
        onChange={onChangeDraftFilters}
        onReset={onResetFilters}
        options={filterOptions}
      />

      <Panel
        actions={<Badge tone="emerald">Live data</Badge>}
        description="Counts from the currently loaded result page."
        title="Result Summary"
      >
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <FileSearch aria-hidden="true" size={16} strokeWidth={2} />
              Policies
            </span>
            <span className="text-sm font-semibold text-ink">{formatCount(policies.length)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Filter aria-hidden="true" size={16} strokeWidth={2} />
              Active filters
            </span>
            <span className="text-sm font-semibold text-ink">{formatCount(activeFilters.length)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Building2 aria-hidden="true" size={16} strokeWidth={2} />
              Linked companies
            </span>
            <span className="text-sm font-semibold text-ink">
              {formatCount(linkedEntityCounts.companies)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Globe2 aria-hidden="true" size={16} strokeWidth={2} />
              Linked countries
            </span>
            <span className="text-sm font-semibold text-ink">
              {formatCount(linkedEntityCounts.countries)}
            </span>
          </div>
        </div>
      </Panel>

      <Panel description="Status distribution from the current result page." title="Status Breakdown">
        <div className="space-y-3">
          {policyStatusValues.map((status) => (
            <div className="flex items-center justify-between gap-3" key={status}>
              <Badge tone={policyStatusTones[status]}>{policyStatusLabels[status]}</Badge>
              <span className="text-sm font-semibold text-ink">{formatCount(statusCounts[status])}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel description="Available filter dimensions from the curated dataset." title="Filter Sources">
        <div className="space-y-3 text-sm text-muted">
          <div className="flex items-center justify-between gap-3">
            <span>Technologies</span>
            <Badge tone="slate">{formatCount(options.technologies.length)}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Companies</span>
            <Badge tone="slate">{formatCount(options.companies.length)}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Countries</span>
            <Badge tone="slate">{formatCount(options.countries.length)}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Sources</span>
            <Badge tone="slate">{formatCount(options.sources.length)}</Badge>
          </div>
        </div>
      </Panel>
    </aside>
  );
}
