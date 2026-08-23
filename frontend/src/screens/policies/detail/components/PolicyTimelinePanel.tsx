import { Badge, Panel } from '@/components/atoms';
import { TimelineFeed } from '@/components/organisms';
import type { PolicyTimelineItem } from '@/lib/api';
import { formatCount } from '@/screens/shared';
import { toPolicyTimelineFeedItems } from '../timelineFeedItems';

type PolicyTimelinePanelProps = {
  timeline: PolicyTimelineItem[];
};

export function PolicyTimelinePanel({ timeline }: PolicyTimelinePanelProps) {
  const timelineFeedItems = toPolicyTimelineFeedItems(timeline);

  return (
    <Panel
      actions={<Badge tone="slate">{formatCount(timeline.length)} records</Badge>}
      description="Revisions and source-backed events ordered by date."
      title="Policy Timeline"
    >
      <TimelineFeed
        emptyDescription="No revisions or source-backed events are linked to this policy yet."
        emptyTitle="No timeline entries linked to this policy"
        items={timelineFeedItems}
      />
    </Panel>
  );
}
