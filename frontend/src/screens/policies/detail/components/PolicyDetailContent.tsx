import { Badge, Panel } from '@/components/atoms';
import type { PolicyDetail, PolicySource, PolicyTimelineItem } from '@/lib/api';
import { formatCount } from '@/screens/shared';
import { CompanyList, TechnologyList } from './PolicyDetailLists';
import { PolicyDetailSidebar } from './PolicyDetailSidebar';
import { PolicyOverviewPanel } from './PolicyOverviewPanel';
import { PolicyTimelinePanel } from './PolicyTimelinePanel';

type PolicyDetailContentProps = {
  policy: PolicyDetail;
  primarySource?: PolicySource;
  timeline: PolicyTimelineItem[];
};

export function PolicyDetailContent({
  policy,
  primarySource,
  timeline,
}: PolicyDetailContentProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-5">
        <PolicyOverviewPanel
          policy={policy}
          primarySource={primarySource}
          timelineCount={timeline.length}
        />

        <PolicyTimelinePanel timeline={timeline} />

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

      <PolicyDetailSidebar policy={policy} />
    </div>
  );
}
