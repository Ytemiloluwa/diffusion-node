import { CalendarDays, GitBranch } from 'lucide-react';
import type { TimelineFeedItem } from '@/components/organisms';
import type { PolicyTimelineItem } from '@/lib/api';
import { formatDate } from '@/screens/shared';
import { ExternalRecordLink } from './components/ExternalRecordLink';
import { PolicyStatusBadge } from './components/PolicyStatusBadge';

export const sortPolicyTimelineItems = (timeline: PolicyTimelineItem[]) =>
  [...timeline].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

export const toPolicyTimelineFeedItems = (timeline: PolicyTimelineItem[]): TimelineFeedItem[] =>
  timeline.map((item) => {
    const isRevision = item.type === 'revision';

    return {
      actions: isRevision ? (
        <>
          <PolicyStatusBadge status={item.previousStatus} />
          <span className="text-xs font-medium text-subtle">to</span>
          <PolicyStatusBadge status={item.newStatus} />
        </>
      ) : null,
      body: isRevision
        ? item.changeSummary ?? 'No revision summary provided.'
        : item.description ?? 'No event description provided.',
      footer: isRevision ? null : (
        <ExternalRecordLink href={item.sourceUrl} label={item.sourceName ?? 'Source pending'} />
      ),
      id: `${item.type}-${item.id}`,
      marker: isRevision ? (
        <GitBranch aria-hidden="true" size={16} strokeWidth={2} />
      ) : (
        <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />
      ),
      metadata: [
        {
          content: formatDate(item.date),
          icon: <CalendarDays aria-hidden="true" size={14} strokeWidth={2} />,
          id: 'date',
        },
      ],
      title: isRevision ? 'Status revision' : item.eventType,
    };
  });
