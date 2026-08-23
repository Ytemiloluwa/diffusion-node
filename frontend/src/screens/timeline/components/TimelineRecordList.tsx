import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { Badge, Spinner } from '@/components/atoms';
import type { TimelineEventWithPolicy } from '@/lib/api';
import { formatUtcDate as formatDate } from '@/screens/shared';
import { formatEventType, getEventTone } from '../timelineModel';
import { EventSourceLink } from './EventSourceLink';
import { PolicyStatusBadge } from './PolicyStatusBadge';

function TimelineEventRecord({ event }: { event: TimelineEventWithPolicy }) {
  return (
    <article className="rounded-panel border border-line bg-surface p-4 shadow-control">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getEventTone(event.eventType)}>{formatEventType(event.eventType)}</Badge>
            <PolicyStatusBadge status={event.policy?.status} />
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-ink">
            {event.description || event.policy?.title || formatEventType(event.eventType)}
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center gap-2 rounded-control bg-surface-muted px-3 py-2 text-sm font-medium text-muted ring-1 ring-inset ring-line">
          <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />
          <span>{formatDate(event.eventDate)}</span>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase text-subtle">Policy</dt>
          <dd className="mt-1 min-w-0 text-sm text-muted">
            {event.policy ? (
              <Link
                className="block break-words font-semibold leading-5 text-brand hover:text-brand-hover"
                href={`/policies/${event.policy.id}`}
              >
                {event.policy.title}
              </Link>
            ) : (
              'General event'
            )}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase text-subtle">Source</dt>
          <dd className="mt-1 min-w-0">
            <EventSourceLink event={event} />
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase text-subtle">Control Number</dt>
          <dd className="mt-1 text-sm font-medium text-muted">
            {event.policy?.controlNumber ?? 'Not assigned'}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase text-subtle">Event Date</dt>
          <dd className="mt-1 text-sm font-medium text-muted">{formatDate(event.eventDate)}</dd>
        </div>
      </dl>
    </article>
  );
}

type TimelineRecordListProps = {
  events: TimelineEventWithPolicy[];
  isLoading: boolean;
};

export function TimelineRecordList({ events, isLoading }: TimelineRecordListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner label="Loading event records" />
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="rounded-panel border border-dashed border-line bg-surface-muted px-4 py-10 text-center">
        <p className="font-semibold text-ink">No event records found</p>
        <p className="mt-1 text-sm text-muted">Adjust the current-page filters or load another page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <TimelineEventRecord event={event} key={event.id} />
      ))}
    </div>
  );
}
