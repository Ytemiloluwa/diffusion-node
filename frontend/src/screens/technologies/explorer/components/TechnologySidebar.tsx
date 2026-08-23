import { Badge, Panel } from '@/components/atoms';
import type { PolicyStatus, TechnologyCategory } from '@/lib/api';
import {
  formatCount,
  policyStatusLabels,
  policyStatusTones,
  policyStatusValues,
} from '@/screens/shared';
import type { TechnologyFilters } from '@/store';
import { getCategoryTone } from '../technologyModel';
import type { CategoryCount, RankedTechnology } from '../types';
import { TechnologyFiltersPanel } from './TechnologyFiltersPanel';

type FilterOption = {
  label: string;
  value: string;
};

type TechnologySidebarProps = {
  activeFilterCount: number;
  categories: TechnologyCategory[];
  categoryDistribution: CategoryCount[];
  categoryOptions: FilterOption[];
  draftFilters: TechnologyFilters;
  isLoading: boolean;
  onApplyFilters: () => void;
  onChangeDraftFilter: (key: keyof TechnologyFilters, value: string) => void;
  onResetFilters: () => void;
  searchQuery: string;
  statusCounts: Record<PolicyStatus, number>;
  topTechnologies: RankedTechnology[];
};

export function TechnologySidebar({
  activeFilterCount,
  categories,
  categoryDistribution,
  categoryOptions,
  draftFilters,
  isLoading,
  onApplyFilters,
  onChangeDraftFilter,
  onResetFilters,
  searchQuery,
  statusCounts,
  topTechnologies,
}: TechnologySidebarProps) {
  return (
    <aside className="space-y-5">
      <TechnologyFiltersPanel
        activeFilterCount={activeFilterCount}
        categoryOptions={categoryOptions}
        draftFilters={draftFilters}
        isLoading={isLoading}
        onApplyFilters={onApplyFilters}
        onChangeDraftFilter={onChangeDraftFilter}
        onResetFilters={onResetFilters}
        searchQuery={searchQuery}
      />

      <Panel
        actions={<Badge tone="emerald">{formatCount(categories.length)} categories</Badge>}
        description="Technology categories returned by the reference dataset."
        title="Category Summary"
      >
        {categories.length ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <div className="flex items-center justify-between gap-3" key={category.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{category.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {category.isActiveInV1 ? 'Included in active scope' : 'Tracked category'}
                  </p>
                </div>
                <Badge tone={getCategoryTone(category)}>
                  {formatCount(category._count?.technologies ?? 0)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No categories returned.</p>
        )}
      </Panel>

      <Panel description="Technology categories represented in the current result set." title="Result Mix">
        {categoryDistribution.length ? (
          <div className="space-y-3">
            {categoryDistribution.map(({ category, count }) => (
              <div className="flex items-center justify-between gap-3" key={category.id}>
                <Badge tone={getCategoryTone(category)}>{category.name}</Badge>
                <span className="text-sm font-semibold text-ink">{formatCount(count)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No category mix available.</p>
        )}
      </Panel>

      <Panel description="Technologies with the broadest active policy exposure." title="Exposure Ranking">
        {topTechnologies.length ? (
          <div className="space-y-3">
            {topTechnologies.map(({ stats, technology }) => (
              <div className="flex items-center justify-between gap-3" key={technology.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{technology.name}</p>
                  <p className="mt-1 text-xs text-muted">{technology.category.name}</p>
                </div>
                <Badge tone={stats.activePolicyCount > 0 ? 'amber' : 'slate'}>
                  {formatCount(stats.activePolicyCount)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No technology exposure to rank.</p>
        )}
      </Panel>

      <Panel description="Policy status mix across the current technology view." title="Policy Status">
        <div className="space-y-3">
          {policyStatusValues.map((status) => (
            <div className="flex items-center justify-between gap-3" key={status}>
              <Badge tone={policyStatusTones[status]}>{policyStatusLabels[status]}</Badge>
              <span className="text-sm font-semibold text-ink">{formatCount(statusCounts[status])}</span>
            </div>
          ))}
        </div>
      </Panel>
    </aside>
  );
}
