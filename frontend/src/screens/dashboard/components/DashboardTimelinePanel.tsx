import { useMemo } from 'react';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { Badge, Panel } from '@/components/atoms';
import { TimelineFeed, type TimelineFeedItem } from '@/components/organisms';
import type { TimelineEventWithPolicy } from '@/lib/api';
import { formatDate } from '@/screens/shared';

type DashboardTimelinePanelProps = {
  isLoading: boolean;
  timeline: TimelineEventWithPolicy[];
};

export function DashboardTimelinePanel({ isLoading, timeline }: DashboardTimelinePanelProps) {
  const timelineFeedItems = useMemo<TimelineFeedItem[]>(
    () =>
      timeline.map((event) => ({
        body: event.description ?? event.eventType,
        footer: event.sourceUrl ? (
          <a
            className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand-hover"
            href={event.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            {event.sourceName ?? 'Source'}
            <ExternalLink aria-hidden="true" size={12} strokeWidth={2} />
          </a>
        ) : event.sourceName ? (
          <span>{event.sourceName}</span>
        ) : null,
        id: event.id,
        marker: <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />,
        metadata: [
          {
            content: formatDate(event.eventDate),
            id: 'date',
          },
        ],
        title: event.policy?.title ?? event.eventType,
      })),
    [timeline],
  );

  return (
    <Panel
      actions={<Badge tone="emerald">Live data</Badge>}
      description="Most recent timeline events in the curated dataset."
      title="Regulatory Timeline"
    >
      <TimelineFeed
        emptyDescription={null}
        emptyTitle="No timeline events found."
        isLoading={isLoading}
        items={timelineFeedItems}
        loadingLabel="Loading timeline"
        variant="compact"
      />
    </Panel>
  );
}
