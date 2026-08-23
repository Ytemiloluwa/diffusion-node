import { ExternalLink } from 'lucide-react';
import type { TimelineEventWithPolicy } from '@/lib/api';
import { getSourceLabel } from '../timelineModel';

type EventSourceLinkProps = {
  event: TimelineEventWithPolicy;
};

export function EventSourceLink({ event }: EventSourceLinkProps) {
  const label = getSourceLabel(event);

  if (!event.sourceUrl) {
    return <span className="text-sm text-muted">{label}</span>;
  }

  return (
    <a
      className="inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-brand hover:text-brand-hover"
      href={event.sourceUrl}
      rel="noreferrer"
      target="_blank"
    >
      <span className="truncate">{label}</span>
      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}
