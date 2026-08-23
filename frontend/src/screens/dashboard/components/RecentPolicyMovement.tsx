import { useMemo } from 'react';
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
import { RECENT_POLICY_LIMIT } from '../constants';

type RecentPolicyMovementProps = {
  isLoading: boolean;
  policies: Policy[];
};

export function RecentPolicyMovement({ isLoading, policies }: RecentPolicyMovementProps) {
  const recentPolicies = useMemo(
    () =>
      [...policies]
        .sort((left, right) => {
          const leftDate = new Date(left.effectiveDate ?? left.updatedAt).getTime();
          const rightDate = new Date(right.effectiveDate ?? right.updatedAt).getTime();

          return rightDate - leftDate;
        })
        .slice(0, RECENT_POLICY_LIMIT),
    [policies],
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Recent Policy Movement</h2>
          <p className="mt-1 text-sm text-muted">Policies sorted by latest effective or updated date.</p>
        </div>
        <Badge tone="slate">{formatCount(recentPolicies.length)} shown</Badge>
      </div>

      {isLoading ? (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Spinner label="Loading recent policies" />
            <span>Loading recent policies</span>
          </div>
        </Panel>
      ) : recentPolicies.length ? (
        recentPolicies.map((policy) => (
          <PolicyCard
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
        <Panel>No recent policy records found.</Panel>
      )}
    </section>
  );
}
