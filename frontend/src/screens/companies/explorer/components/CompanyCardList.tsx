import Link from 'next/link';
import { Badge, Panel, Spinner } from '@/components/atoms';
import type { Company } from '@/lib/api';
import { formatCount, formatDate } from '@/screens/shared';
import { getEntityStatusTone } from '../companyModel';
import type { CompanyStats } from '../types';
import { CountryLabel, CountryPill } from './CompanyCountryLabels';

type CompanyCardProps = {
  company: Company;
  onViewPolicies: (company: Company) => void;
  stats?: CompanyStats;
};

function CompanyCard({ company, onViewPolicies, stats }: CompanyCardProps) {
  const technologies = stats ? [...stats.technologies].slice(0, 4) : [];
  const countries = stats ? [...stats.countries.entries()].slice(0, 4) : [];

  return (
    <article className="rounded-panel border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{company.name}</h2>
          <p className="mt-1 text-sm text-muted">
            <CountryLabel country={company.hqCountry} />
          </p>
        </div>
        <Badge tone={getEntityStatusTone(company.entityListStatus)}>
          {company.entityListStatus ?? 'Not listed'}
        </Badge>
      </div>

      {company.aliases.length ? (
        <p className="mt-3 text-sm leading-6 text-muted">{company.aliases.join(', ')}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Policies</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatCount(stats?.policyCount ?? 0)}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Technologies</p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {formatCount(stats?.technologies.size ?? 0)}
          </p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-3">
          <p className="text-xs font-semibold uppercase text-muted">Latest policy</p>
          <p className="mt-2 text-sm font-semibold text-ink">{formatDate(stats?.latestPolicyDate)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {technologies.map((technology) => (
          <Badge key={technology} tone="slate">
            {technology}
          </Badge>
        ))}
        {countries.map(([isoCode, name]) => (
          <CountryPill isoCode={isoCode} key={isoCode} name={name} />
        ))}
      </div>

      <div className="mt-4">
        <Link
          className="inline-flex h-8 items-center justify-center rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href="/policies"
          onClick={() => onViewPolicies(company)}
        >
          View policies
        </Link>
      </div>
    </article>
  );
}

type CompanyCardListProps = {
  companies: Company[];
  isLoading: boolean;
  onViewPolicies: (company: Company) => void;
  policyStats: Map<string, CompanyStats>;
};

export function CompanyCardList({
  companies,
  isLoading,
  onViewPolicies,
  policyStats,
}: CompanyCardListProps) {
  const companyCards = companies.slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Company Cards</h2>
          <p className="mt-1 text-sm text-muted">
            Compact company exposure summaries from the current result page.
          </p>
        </div>
        <Badge tone="slate">{formatCount(companyCards.length)} shown</Badge>
      </div>

      {isLoading ? (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Spinner label="Loading companies" />
            <span>Loading companies</span>
          </div>
        </Panel>
      ) : companies.length ? (
        companyCards.map((company) => (
          <CompanyCard
            company={company}
            key={company.id}
            onViewPolicies={onViewPolicies}
            stats={policyStats.get(company.id)}
          />
        ))
      ) : (
        <Panel>No company cards to show.</Panel>
      )}
    </section>
  );
}
