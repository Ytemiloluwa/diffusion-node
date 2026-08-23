import { CalendarDays } from 'lucide-react';
import { Badge } from '@/components/atoms';
import type { TimelineFeedItem } from '@/components/organisms';
import type { TimelineEventWithPolicy } from '@/lib/api';
import { formatUtcDate as formatDate } from '@/screens/shared';
import { EventSourceLink } from './components/EventSourceLink';
import { PolicyStatusBadge } from './components/PolicyStatusBadge';
import {
  formatEventType,
  getEventTone,
  getSourceHost,
} from './timelineModel';

export const toTimelineFeedItems = (events: TimelineEventWithPolicy[]): TimelineFeedItem[] =>
  events.map((event) => ({
    badges: (
      <>
        <Badge tone={getEventTone(event.eventType)}>{formatEventType(event.eventType)}</Badge>
        <PolicyStatusBadge status={event.policy?.status} />
      </>
    ),
    detailLink: event.policy
      ? {
          href: `/policies/${event.policy.id}`,
          label: event.policy.title,
        }
      : undefined,
    detailText: event.policy ? undefined : 'General timeline event',
    footer: (
      <>
        <EventSourceLink event={event} />
        {event.sourceUrl ? <span>{getSourceHost(event.sourceUrl)}</span> : null}
      </>
    ),
    id: event.id,
    marker: <CalendarDays aria-hidden="true" className="h-4 w-4" />,
    markerClassName: 'rounded-full',
    metadata: [
      {
        content: formatDate(event.eventDate),
        icon: <CalendarDays aria-hidden="true" size={14} strokeWidth={2} />,
        id: 'date',
      },
      ...(event.policy?.controlNumber
        ? [
            {
              content: <span className="uppercase text-subtle">{event.policy.controlNumber}</span>,
              id: 'controlNumber',
            },
          ]
        : []),
    ],
    title: event.description || event.policy?.title || formatEventType(event.eventType),
  }));
