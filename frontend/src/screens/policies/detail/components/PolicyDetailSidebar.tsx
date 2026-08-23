import { Building2, Cpu, Globe2 } from 'lucide-react';
import { Badge, Panel } from '@/components/atoms';
import type { PolicyDetail } from '@/lib/api';
import { formatCount, formatDate } from '@/screens/shared';
import { JurisdictionList, SourceList } from './PolicyDetailLists';

type PolicyDetailSidebarProps = {
  policy: PolicyDetail;
};

export function PolicyDetailSidebar({ policy }: PolicyDetailSidebarProps) {
  return (
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
        <div className="space-y-3 text-sm text-muted">
          <div className="flex items-center justify-between gap-3">
            <span>Created</span>
            <span className="font-semibold text-ink">{formatDate(policy.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Updated</span>
            <span className="font-semibold text-ink">{formatDate(policy.updatedAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Revisions</span>
            <span className="font-semibold text-ink">{formatCount(policy.revisions.length)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Events</span>
            <span className="font-semibold text-ink">{formatCount(policy.timelineEvents.length)}</span>
          </div>
        </div>
      </Panel>

      <Panel description="Linked entity counts for this record." title="Coverage">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Cpu aria-hidden="true" size={16} strokeWidth={2} />
              Technologies
            </span>
            <Badge tone="sky">{formatCount(policy.technologies.length)}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Building2 aria-hidden="true" size={16} strokeWidth={2} />
              Companies
            </span>
            <Badge tone="emerald">{formatCount(policy.companies.length)}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Globe2 aria-hidden="true" size={16} strokeWidth={2} />
              Jurisdictions
            </span>
            <Badge tone="amber">{formatCount(policy.jurisdictions.length)}</Badge>
          </div>
        </div>
      </Panel>
    </aside>
  );
}
