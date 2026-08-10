'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Cpu,
  ExternalLink,
  FileText,
  GitBranch,
  Globe2,
  Landmark,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { Badge, Button, Panel, Spinner, type BadgeProps } from '@/components/atoms';
import { DashboardShell } from '@/components/templates';
import {
  getPolicy,
  getPolicyTimeline,
  type Document,
  type Jurisdiction,
  type PolicyCompany,
  type PolicyDetail,
  type PolicySource,
  type PolicyStatus,
  type PolicyTechnology,
  type PolicyTimelineItem,
} from '@/lib/api';
import { useAuthStore } from '@/store';

export type PolicyDetailPageProps = {
  policyId: string;
};

const statusLabels: Record<PolicyStatus, string> = {
  ACTIVE: 'Active',
  CONTESTED: 'Contested',
  DRAFT: 'Draft',
  RESCINDED: 'Rescinded',
  SUPERSEDED: 'Superseded',
};

const statusTones: Record<PolicyStatus, BadgeProps['tone']> = {
  ACTIVE: 'emerald',
  CONTESTED: 'amber',
  DRAFT: 'slate',
  RESCINDED: 'red',
  SUPERSEDED: 'sky',
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatCount = (value: number): string => value.toLocaleString('en-US');

const getDisplayName = (email?: string): string => {
  if (!email) {
    return 'Analyst';
  }

  const localPart = email.split('@')[0] ?? email;
  const words = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.length ? words.join(' ') : email;
};

const getInitials = (email?: string): string => {
  if (!email) {
    return 'DN';
  }

  const words = email.split('@')[0]?.split(/[._-]+/).filter(Boolean) ?? [];
  const initials = words.map((word) => word.charAt(0).toUpperCase()).join('');

  return (initials || email.slice(0, 2).toUpperCase()).slice(0, 2);
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Policy detail could not be loaded.';
};

const uniqueJurisdictions = (jurisdictions: Jurisdiction[]): Jurisdiction[] => {
  const seen = new Set<string>();

  return jurisdictions.filter((jurisdiction) => {
    const key = `${jurisdiction.countryId}:${jurisdiction.restrictionTypeId}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

function ExternalRecordLink({
  href,
  label,
}: {
  href?: string | null;
  label: string;
}) {
  if (!href) {
    return <span className="text-sm text-slate-500">{label}</span>;
  }

  return (
    <a
      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:text-teal-900"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink aria-hidden="true" size={13} strokeWidth={2} />
    </a>
  );
}

function EmptyPanelText({ children }: { children: string }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function TimelineStatusBadge({ status }: { status: PolicyStatus | null }) {
  if (!status) {
    return <Badge tone="slate">Not set</Badge>;
  }

  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}

function TimelineEntry({ item }: { item: PolicyTimelineItem }) {
  const isRevision = item.type === 'revision';

  return (
    <li className="relative pl-11">
      <span className="absolute left-0 top-1 flex size-8 items-center justify-center rounded-md bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
        {isRevision ? (
          <GitBranch aria-hidden="true" size={16} strokeWidth={2} />
        ) : (
          <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />
        )}
      </span>

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">
              {isRevision ? 'Status revision' : item.eventType}
            </p>
            <p className="mt-1 text-sm text-slate-500">{formatDate(item.date)}</p>
          </div>
          {isRevision ? (
            <div className="flex flex-wrap items-center gap-2">
              <TimelineStatusBadge status={item.previousStatus} />
              <span className="text-xs font-medium text-slate-400">to</span>
              <TimelineStatusBadge status={item.newStatus} />
            </div>
          ) : null}
        </div>

        {isRevision ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {item.changeSummary ?? 'No revision summary provided.'}
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {item.description ?? 'No event description provided.'}
            </p>
            <div className="mt-3">
              <ExternalRecordLink href={item.sourceUrl} label={item.sourceName ?? 'Source pending'} />
            </div>
          </>
        )}
      </div>
    </li>
  );
}

function SourceList({ documents, sources }: { documents: Document[]; sources: PolicySource[] }) {
  const hasSources = sources.length > 0;
  const hasDocuments = documents.length > 0;

  if (!hasSources && !hasDocuments) {
    return <EmptyPanelText>No source records linked to this policy.</EmptyPanelText>;
  }

  return (
    <div className="space-y-4">
      {hasSources ? (
        <div className="space-y-3">
          {sources.map((source) => (
            <div className="rounded-md border border-slate-200 p-3" key={source.id}>
              <ExternalRecordLink href={source.sourceUrl} label={source.sourceName} />
              <p className="mt-1 text-xs text-slate-500">
                Published {formatDate(source.publishedDate)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {hasDocuments ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <div className="rounded-md border border-slate-200 p-3" key={document.id}>
              <ExternalRecordLink href={document.url} label={document.title} />
              <p className="mt-1 text-xs text-slate-500">
                {document.documentType} - {formatDate(document.publishedDate)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TechnologyList({ technologies }: { technologies: PolicyTechnology[] }) {
  if (!technologies.length) {
    return <EmptyPanelText>No linked technologies.</EmptyPanelText>;
  }

  return (
    <div className="space-y-3">
      {technologies.map(({ id, technology }) => (
        <div className="rounded-md border border-slate-200 p-3" key={id}>
          <p className="text-sm font-semibold text-slate-950">{technology.name}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{technology.category.name}</p>
          {technology.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{technology.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CompanyList({ companies }: { companies: PolicyCompany[] }) {
  if (!companies.length) {
    return <EmptyPanelText>No linked companies.</EmptyPanelText>;
  }

  return (
    <div className="space-y-3">
      {companies.map(({ company, id }) => (
        <div className="rounded-md border border-slate-200 p-3" key={id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">{company.name}</p>
              <p className="mt-1 text-xs text-slate-500">{company.hqCountry.name}</p>
            </div>
            {company.entityListStatus ? <Badge tone="slate">{company.entityListStatus}</Badge> : null}
          </div>
          {company.aliases.length ? (
            <p className="mt-2 text-sm text-slate-600">{company.aliases.join(', ')}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function JurisdictionList({ jurisdictions }: { jurisdictions: Jurisdiction[] }) {
  const rows = uniqueJurisdictions(jurisdictions);

  if (!rows.length) {
    return <EmptyPanelText>No linked jurisdictions.</EmptyPanelText>;
  }

  return (
    <div className="space-y-3">
      {rows.map((jurisdiction) => (
        <div className="flex items-start justify-between gap-3 rounded-md border border-slate-200 p-3" key={jurisdiction.id}>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">{jurisdiction.country.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {jurisdiction.country.tierClassification ?? jurisdiction.country.isoCode}
            </p>
          </div>
          <Badge tone="amber">{jurisdiction.restrictionType.name}</Badge>
        </div>
      ))}
    </div>
  );
}

export function PolicyDetailPage({ policyId }: PolicyDetailPageProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const user = useAuthStore((state) => state.user);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [timeline, setTimeline] = useState<PolicyTimelineItem[]>([]);

  const loadPolicyDetail = useCallback(async () => {
    if (!useAuthStore.getState().accessToken) {
      router.replace('/auth');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const profile = await loadProfile();

      if (!profile) {
        router.replace('/auth');
        return;
      }

      const [policyDetail, timelineItems] = await Promise.all([
        getPolicy(policyId),
        getPolicyTimeline(policyId),
      ]);

      setPolicy(policyDetail);
      setTimeline(timelineItems);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
      setPolicy(null);
      setTimeline([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile, policyId, router]);

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    const hydrationTimer = window.setTimeout(() => {
      setHasHydrated(persistApi.hasHydrated());
    }, 0);
    const unsubscribe = persistApi.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return () => {
      window.clearTimeout(hydrationTimer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return undefined;
    }

    if (!accessToken) {
      router.replace('/auth');
      return undefined;
    }

    const loadTimer = window.setTimeout(() => {
      void loadPolicyDetail();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [accessToken, hasHydrated, loadPolicyDetail, router]);

  const timelineItems = useMemo(
    () => [...timeline].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()),
    [timeline],
  );

  const primarySource = policy?.sources.find((source) => source.sourceUrl) ?? policy?.sources[0];

  return (
    <DashboardShell
      actions={
        <>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            href="/policies"
          >
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
            Policy Explorer
          </Link>
          <Button
            isLoading={isLoading}
            leadingIcon={<RefreshCw aria-hidden="true" size={16} strokeWidth={2} />}
            onClick={() => void loadPolicyDetail()}
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
        <Panel className="mb-5 border-red-200 bg-red-50" title="Policy detail unavailable">
          <div className="flex gap-3 text-sm text-red-800">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <p>{error}</p>
          </div>
        </Panel>
      ) : null}

      {isLoading ? (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Spinner label="Loading policy detail" />
            <span>Loading policy detail</span>
          </div>
        </Panel>
      ) : policy ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-5">
            <Panel
              actions={<Badge tone={statusTones[policy.status]}>{statusLabels[policy.status]}</Badge>}
              title="Policy Overview"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <FileText aria-hidden="true" size={14} strokeWidth={2} />
                    Control
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {policy.controlNumber ?? 'Not assigned'}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <CalendarDays aria-hidden="true" size={14} strokeWidth={2} />
                    Effective
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatDate(policy.effectiveDate)}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <Landmark aria-hidden="true" size={14} strokeWidth={2} />
                    Source
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {primarySource?.sourceName ?? 'Source pending'}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <GitBranch aria-hidden="true" size={14} strokeWidth={2} />
                    Timeline
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatCount(timelineItems.length)} events
                  </p>
                </div>
              </div>
            </Panel>

            <Panel
              actions={<Badge tone="slate">{formatCount(timelineItems.length)} records</Badge>}
              description="Revisions and source-backed events ordered by date."
              title="Policy Timeline"
            >
              {timelineItems.length ? (
                <ol className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
                  {timelineItems.map((item) => (
                    <TimelineEntry item={item} key={`${item.type}-${item.id}`} />
                  ))}
                </ol>
              ) : (
                <EmptyPanelText>No timeline entries linked to this policy.</EmptyPanelText>
              )}
            </Panel>

            <div className="grid gap-5 xl:grid-cols-2">
              <Panel
                actions={<Badge tone="sky">{formatCount(policy.technologies.length)} linked</Badge>}
                title="Technologies"
              >
                <TechnologyList technologies={policy.technologies} />
              </Panel>

              <Panel
                actions={<Badge tone="emerald">{formatCount(policy.companies.length)} linked</Badge>}
                title="Companies"
              >
                <CompanyList companies={policy.companies} />
              </Panel>
            </div>
          </div>

          <aside className="space-y-5">
            <Panel
              actions={<Badge tone="amber">{formatCount(policy.jurisdictions.length)} links</Badge>}
              title="Jurisdictions"
            >
              <JurisdictionList jurisdictions={policy.jurisdictions} />
            </Panel>

            <Panel
              actions={<Badge tone="slate">{formatCount(policy.sources.length + policy.documents.length)}</Badge>}
              description="Primary records and supporting documents linked to this policy."
              title="Source Material"
            >
              <SourceList documents={policy.documents} sources={policy.sources} />
            </Panel>

            <Panel description="Database metadata for the selected policy." title="Record Metadata">
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Created</span>
                  <span className="font-semibold text-slate-950">{formatDate(policy.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Updated</span>
                  <span className="font-semibold text-slate-950">{formatDate(policy.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Revisions</span>
                  <span className="font-semibold text-slate-950">{formatCount(policy.revisions.length)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Events</span>
                  <span className="font-semibold text-slate-950">
                    {formatCount(policy.timelineEvents.length)}
                  </span>
                </div>
              </div>
            </Panel>

            <Panel description="Linked entity counts for this record." title="Coverage">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Cpu aria-hidden="true" size={16} strokeWidth={2} />
                    Technologies
                  </span>
                  <Badge tone="sky">{formatCount(policy.technologies.length)}</Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Building2 aria-hidden="true" size={16} strokeWidth={2} />
                    Companies
                  </span>
                  <Badge tone="emerald">{formatCount(policy.companies.length)}</Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Globe2 aria-hidden="true" size={16} strokeWidth={2} />
                    Jurisdictions
                  </span>
                  <Badge tone="amber">{formatCount(policy.jurisdictions.length)}</Badge>
                </div>
              </div>
            </Panel>
          </aside>
        </div>
      ) : null}
    </DashboardShell>
  );
}
