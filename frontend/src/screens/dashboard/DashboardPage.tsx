'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button, Panel } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import { getDisplayName, getInitials } from '@/screens/shared';
import {
  CountryExposurePanel,
  DashboardMetrics,
  DashboardPolicyTable,
  DashboardTimelinePanel,
  PolicyStatusPanel,
  RecentPolicyMovement,
} from './components';
import { useDashboardData } from './hooks/useDashboardData';

export function DashboardPage() {
  const { data, error, isLoading, refresh, user } = useDashboardData();

  return (
    <DashboardShell
      actions={
        <Button
          isLoading={isLoading}
          leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
          onClick={() => void refresh()}
          variant="secondary"
        >
          Refresh data
        </Button>
      }
      activeItem="dashboard"
      description="Track semiconductor and AI export-control policy changes, affected technologies, companies, and jurisdictions from one analyst workspace."
      eyebrow="Policy intelligence"
      title="Dashboard"
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Dashboard data unavailable">
          <div className="flex gap-3 text-sm text-danger">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      <DashboardMetrics data={data} isLoading={isLoading} />

      <DashboardPolicyTable
        hasMorePolicies={data.hasMorePolicies}
        isLoading={isLoading}
        policies={data.policies}
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(24rem,0.9fr)]">
        <RecentPolicyMovement isLoading={isLoading} policies={data.policies} />

        <aside className="space-y-5">
          <DashboardTimelinePanel isLoading={isLoading} timeline={data.timeline} />
          <CountryExposurePanel countries={data.countries} isLoading={isLoading} />
          <PolicyStatusPanel policies={data.policies} />
        </aside>
      </div>
    </DashboardShell>
  );
}
