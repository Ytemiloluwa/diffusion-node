import { Panel } from '@/components/atoms';
import { PaginationControls } from '@/components/molecules';
import { TimelineFeed, type TimelineFeedItem } from '@/components/organisms';
import type { PageInfo } from '@/lib/api';

type TimelineFeedPanelProps = {
  hasPreviousPage: boolean;
  isLoading: boolean;
  items: TimelineFeedItem[];
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageInfo: PageInfo;
  pageNumber: number;
};

export function TimelineFeedPanel({
  hasPreviousPage,
  isLoading,
  items,
  onNextPage,
  onPreviousPage,
  pageInfo,
  pageNumber,
}: TimelineFeedPanelProps) {
  return (
    <Panel
      actions={
        <PaginationControls
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={hasPreviousPage}
          isLoading={isLoading}
          onNext={onNextPage}
          onPrevious={onPreviousPage}
          pageLabel={`Page ${pageNumber}`}
        />
      }
      description="Events are ordered from newest to oldest."
      title="Timeline Feed"
    >
      <TimelineFeed
        emptyDescription="Adjust the current-page filters or load another page."
        emptyTitle="No timeline events found"
        isLoading={isLoading}
        items={items}
        loadingLabel="Loading timeline"
      />
    </Panel>
  );
}
