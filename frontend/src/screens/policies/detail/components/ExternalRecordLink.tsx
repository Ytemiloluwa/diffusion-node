import { ExternalLink } from 'lucide-react';

type ExternalRecordLinkProps = {
  href?: string | null;
  label: string;
};

export function ExternalRecordLink({ href, label }: ExternalRecordLinkProps) {
  if (!href) {
    return <span className="text-sm text-muted">{label}</span>;
  }

  return (
    <a
      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink aria-hidden="true" size={13} strokeWidth={2} />
    </a>
  );
}
