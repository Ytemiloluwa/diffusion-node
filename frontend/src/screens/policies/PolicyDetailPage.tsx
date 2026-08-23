'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button, Panel, Spinner } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import { getDisplayName, getInitials } from '@/screens/shared';
import { PolicyDetailContent } from './detail/components';
import { usePolicyDetailData } from './detail/hooks/usePolicyDetailData';

export type PolicyDetailPageProps = {
  policyId: string;
};

export function PolicyDetailPage({ policyId }: PolicyDetailPageProps) {
  const {
    error,
    isLoading,
    policy,
    primarySource,
    refresh,
    timelineItems,
    user,
  } = usePolicyDetailData(policyId);

  return (
    <DashboardShell
      actions={
        <>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-control border border-line-strong bg-surface px-4 text-sm font-medium text-ink shadow-control transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            href="/policies"
          >
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
            Policy Explorer
          </Link>
          <Button
            isLoading={isLoading}
            leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
            onClick={() => void refresh()}
            variant="secondary"
          >
            Refresh
          </Button>
        </>
      }
      activeItem="policy-explorer"
      description={
        policy?.summary ??
        'Review policy metadata, linked entities, source material, and timeline events.'
      }
      eyebrow="Policy timeline"
      title={policy?.title ?? 'Policy Detail'}
      userInitials={getInitials(user?.email)}
      userName={getDisplayName(user?.email)}
    >
      {error ? (
        <Panel className="mb-5 border-danger-line bg-danger-soft" title="Policy detail unavailable">
          <div className="flex gap-3 text-sm text-danger">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      {isLoading ? (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Spinner label="Loading policy detail" />
            <span>Loading policy detail</span>
          </div>
        </Panel>
      ) : policy ? (
        <PolicyDetailContent
          policy={policy}
          primarySource={primarySource}
          timeline={timelineItems}
        />
      ) : null}
    </DashboardShell>
  );
}
