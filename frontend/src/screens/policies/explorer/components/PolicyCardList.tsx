import Link from 'next/link';
import { Badge, Panel, Spinner } from '@/components/atoms';
import { PolicyCard } from '@/components/molecules';
import type { Policy } from '@/lib/api';
import {
  formatCount,
  formatDate,
  getPolicyCompanyNames,
  getPolicyCountryNames,
  getPolicySourceName,
  getPolicyTechnologyNames,
} from '@/screens/shared';

type PolicyCardListProps = {
  isLoading: boolean;
  policies: Policy[];
};

export function PolicyCardList({ isLoading, policies }: PolicyCardListProps) {
  const policyCards = policies.slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Policy Cards</h2>
          <p className="mt-1 text-sm text-muted">Compact policy summaries from the current result page.</p>
        </div>
        <Badge tone="slate">{formatCount(policyCards.length)} shown</Badge>
      </div>

      {isLoading ? (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Spinner label="Loading policies" />
            <span>Loading policies</span>
          </div>
        </Panel>
      ) : policies.length ? (
        policyCards.map((policy) => (
          <PolicyCard
            actions={
              <Link
                className="inline-flex h-8 items-center justify-center rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                href={`/policies/${policy.id}`}
              >
                Details
              </Link>
            }
            companies={getPolicyCompanyNames(policy).slice(0, 4)}
            controlNumber={policy.controlNumber ?? undefined}
            countries={getPolicyCountryNames(policy).slice(0, 4)}
            effectiveDate={formatDate(policy.effectiveDate)}
            key={policy.id}
            sourceName={getPolicySourceName(policy)}
            status={policy.status}
            summary={policy.summary ?? undefined}
            technologies={getPolicyTechnologyNames(policy).slice(0, 4)}
            title={policy.title}
          />
        ))
      ) : (
        <Panel>No policy cards to show.</Panel>
      )}
    </section>
  );
}
