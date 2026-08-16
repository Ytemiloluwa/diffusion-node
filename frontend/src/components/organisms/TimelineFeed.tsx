'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { Spinner } from '@/components/atoms';
import { cn } from '@/lib/cn';

export type TimelineFeedLink = {
  href: string;
  label: ReactNode;
};

export type TimelineFeedMetadata = {
  content: ReactNode;
  icon?: ReactNode;
  id: string;
};

export type TimelineFeedItem = {
  actions?: ReactNode;
  badges?: ReactNode;
  body?: ReactNode;
  detailLink?: TimelineFeedLink;
  detailText?: ReactNode;
  footer?: ReactNode;
  id: string;
  marker: ReactNode;
  markerClassName?: string;
  metadata?: TimelineFeedMetadata[];
  title: ReactNode;
};

export type TimelineFeedProps = {
  className?: string;
  emptyDescription?: ReactNode;
  emptyTitle?: ReactNode;
  isLoading?: boolean;
  items: TimelineFeedItem[];
  loadingLabel?: string;
  variant?: 'card' | 'compact';
};

function TimelineDetailLink({ href, label }: TimelineFeedLink) {
  return (
    <Link
      className="mt-2 inline-flex max-w-full items-start gap-1.5 text-sm font-semibold leading-5 text-brand hover:text-brand-hover"
      href={href}
    >
      <span className="min-w-0 break-words">{label}</span>
      <ExternalLink aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
    </Link>
  );
}

function TimelineEmptyState({
  description,
  title,
}: {
  description?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className="rounded-panel border border-dashed border-line bg-surface-muted px-4 py-10 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </div>
  );
}

function TimelineFeedCard({ item }: { item: TimelineFeedItem }) {
  return (
    <li className="relative pl-11">
      <span
        className={cn(
          'absolute left-0 top-1 flex size-8 items-center justify-center rounded-control bg-brand-soft text-brand ring-1 ring-inset ring-brand-line',
          item.markerClassName,
        )}
      >
        {item.marker}
      </span>

      <article className="rounded-panel border border-line bg-surface p-4 shadow-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {item.badges ? <div className="flex flex-wrap items-center gap-2">{item.badges}</div> : null}
            <h3 className={cn('text-base font-semibold leading-6 text-ink', item.badges ? 'mt-3' : undefined)}>
              {item.title}
            </h3>
            {item.detailLink ? <TimelineDetailLink {...item.detailLink} /> : null}
            {item.detailText ? <p className="mt-2 text-sm text-muted">{item.detailText}</p> : null}
          </div>
          {item.actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{item.actions}</div> : null}
        </div>

        {item.metadata?.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {item.metadata.map((metadata) => (
              <span
                className="inline-flex max-w-full items-center gap-1.5 rounded-control bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted ring-1 ring-inset ring-line"
                key={metadata.id}
              >
                {metadata.icon}
                <span className="min-w-0 break-words">{metadata.content}</span>
              </span>
            ))}
          </div>
        ) : null}

        {item.body ? <div className="mt-3 text-sm leading-6 text-muted">{item.body}</div> : null}

        {item.footer ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-sm text-muted">
            {item.footer}
          </div>
        ) : null}
      </article>
    </li>
  );
}

function CompactTimelineItem({ item }: { item: TimelineFeedItem }) {
  return (
    <article className="flex gap-3">
      <span
        className={cn(
          'mt-1 flex size-8 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand',
          item.markerClassName,
        )}
      >
        {item.marker}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
        {item.body ? <div className="mt-1 text-sm text-muted">{item.body}</div> : null}
        {item.metadata?.length || item.footer ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {item.metadata?.map((metadata) => (
              <span className="inline-flex items-center gap-1" key={metadata.id}>
                {metadata.icon}
                {metadata.content}
              </span>
            ))}
            {item.footer}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function TimelineFeed({
  className,
  emptyDescription = 'No timeline entries found.',
  emptyTitle = 'No timeline entries found',
  isLoading = false,
  items,
  loadingLabel = 'Loading timeline',
  variant = 'card',
}: TimelineFeedProps) {
  if (isLoading) {
    if (variant === 'compact') {
      return (
        <div className={cn('flex items-center gap-3 text-sm text-muted', className)}>
          <Spinner label={loadingLabel} />
          <span>{loadingLabel}</span>
        </div>
      );
    }

    return (
      <div className={cn('flex min-h-56 items-center justify-center', className)}>
        <Spinner label={loadingLabel} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <TimelineEmptyState
        description={emptyDescription}
        title={emptyTitle}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {items.map((item) => (
          <CompactTimelineItem item={item} key={item.id} />
        ))}
      </div>
    );
  }

  return (
    <ol
      className={cn(
        'relative space-y-4 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-line',
        className,
      )}
    >
      {items.map((item) => (
        <TimelineFeedCard item={item} key={item.id} />
      ))}
    </ol>
  );
}
