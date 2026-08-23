import Link from 'next/link';
import { Badge, Panel, Spinner } from '@/components/atoms';
import type { Technology } from '@/lib/api';
import { formatCount, formatDate } from '@/screens/shared';
import { getCategoryTone } from '../technologyModel';
import type { TechnologyStats } from '../types';
import { TechnologyCountryPill } from './TechnologyCountryPill';

type TechnologyCardProps = {
  onViewPolicies: (technology: Technology) => void;
  stats?: TechnologyStats;
  technology: Technology;
};

function TechnologyCard({
  onViewPolicies,
  stats,
  technology,
}: TechnologyCardProps) {
  const companies = stats ? [...stats.companies.values()].slice(0, 3) : [];
  const countries = stats ? [...stats.countries.values()].slice(0, 4) : [];

  return (
    <article className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{technology.name}</h2>
          <p className="mt-1 text-sm text-muted">{technology.category.name}</p>
        </div>
        <Badge tone={getCategoryTone(technology.category)}>
          {technology.category.isActiveInV1 ? 'V1 scope' : 'Tracked'}
        </Badge>
      </div>

      {technology.description ? (
        <p className="mt-3 text-sm leading-6 text-muted">{technology.description}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Policies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(stats?.policyCount ?? 0)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Companies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(stats?.companies.size ?? 0)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Latest policy</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatDate(stats?.latestPolicyDate)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {countries.map((country) => (
          <TechnologyCountryPill country={country} key={`${technology.id}-${country.isoCode}`} />
        ))}
        {companies.map((company) => (
          <Badge key={`${technology.id}-${company}`} tone="slate">
            {company}
          </Badge>
        ))}
      </div>

      <div className="mt-4">
        <Link
          className="inline-flex h-8 items-center justify-center rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href="/policies"
          onClick={() => onViewPolicies(technology)}
        >
          View policies
        </Link>
      </div>
    </article>
  );
}

type TechnologyCardListProps = {
  isLoading: boolean;
  onViewPolicies: (technology: Technology) => void;
  policyStats: Map<string, TechnologyStats>;
  technologies: Technology[];
};

export function TechnologyCardList({
  isLoading,
  onViewPolicies,
  policyStats,
  technologies,
}: TechnologyCardListProps) {
  const technologyCards = technologies.slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Technology Cards</h2>
          <p className="mt-1 text-sm text-muted">
            Compact technology exposure summaries from the current result page.
          </p>
        </div>
        <Badge tone="slate">{formatCount(technologyCards.length)} shown</Badge>
      </div>

      {isLoading ? (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Spinner label="Loading technologies" />
            <span>Loading technologies</span>
          </div>
        </Panel>
      ) : technologies.length ? (
        technologyCards.map((technology) => (
          <TechnologyCard
            key={technology.id}
            onViewPolicies={onViewPolicies}
            stats={policyStats.get(technology.id)}
            technology={technology}
          />
        ))
      ) : (
        <Panel>No technology cards to show.</Panel>
      )}
    </section>
  );
}
