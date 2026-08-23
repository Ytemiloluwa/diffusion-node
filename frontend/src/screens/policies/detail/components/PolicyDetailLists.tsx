import { Badge, CountryFlag } from '@/components/atoms';
import type {
  Document as PolicyDocument,
  Jurisdiction,
  PolicyCompany,
  PolicySource,
  PolicyTechnology,
} from '@/lib/api';
import { formatDate } from '@/screens/shared';
import { ExternalRecordLink } from './ExternalRecordLink';

function EmptyPanelText({ children }: { children: string }) {
  return <p className="text-sm text-muted">{children}</p>;
}

const uniqueJurisdictions = (jurisdictions: Jurisdiction[]): Jurisdiction[] => {
  const seen = new Set<string>();

  return jurisdictions.filter((jurisdiction) => {
    const key = `${jurisdiction.countryId}:${jurisdiction.restrictionTypeId}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export function SourceList({
  documents,
  sources,
}: {
  documents: PolicyDocument[];
  sources: PolicySource[];
}) {
  const hasSources = sources.length > 0;
  const hasDocuments = documents.length > 0;

  if (!hasSources && !hasDocuments) {
    return <EmptyPanelText>No source records linked to this policy.</EmptyPanelText>;
  }

  return (
    <div className="space-y-4">
      {hasSources ? (
        <div className="space-y-3">
          {sources.map((source) => (
            <div className="rounded-panel border border-line bg-surface-raised p-3" key={source.id}>
              <ExternalRecordLink href={source.sourceUrl} label={source.sourceName} />
              <p className="mt-1 text-xs text-muted">Published {formatDate(source.publishedDate)}</p>
            </div>
          ))}
        </div>
      ) : null}

      {hasDocuments ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <div className="rounded-panel border border-line bg-surface-raised p-3" key={document.id}>
              <ExternalRecordLink href={document.url} label={document.title} />
              <p className="mt-1 text-xs text-muted">
                {document.documentType} - {formatDate(document.publishedDate)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TechnologyList({ technologies }: { technologies: PolicyTechnology[] }) {
  if (!technologies.length) {
    return <EmptyPanelText>No linked technologies.</EmptyPanelText>;
  }

  return (
    <div className="space-y-3">
      {technologies.map(({ id, technology }) => (
        <div className="rounded-panel border border-line bg-surface-raised p-3" key={id}>
          <p className="text-sm font-semibold text-ink">{technology.name}</p>
          <p className="mt-1 text-xs font-medium text-muted">{technology.category.name}</p>
          {technology.description ? (
            <p className="mt-2 text-sm leading-6 text-muted">{technology.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CompanyList({ companies }: { companies: PolicyCompany[] }) {
  if (!companies.length) {
    return <EmptyPanelText>No linked companies.</EmptyPanelText>;
  }

  return (
    <div className="space-y-3">
      {companies.map(({ company, id }) => (
        <div className="rounded-panel border border-line bg-surface-raised p-3" key={id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{company.name}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted">
                <CountryFlag
                  className="h-3.5 w-5"
                  countryCode={company.hqCountry.isoCode}
                  countryName={company.hqCountry.name}
                />
                <span>{company.hqCountry.name}</span>
              </p>
            </div>
            {company.entityListStatus ? <Badge tone="slate">{company.entityListStatus}</Badge> : null}
          </div>
          {company.aliases.length ? <p className="mt-2 text-sm text-muted">{company.aliases.join(', ')}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function JurisdictionList({ jurisdictions }: { jurisdictions: Jurisdiction[] }) {
  const rows = uniqueJurisdictions(jurisdictions);

  if (!rows.length) {
    return <EmptyPanelText>No linked jurisdictions.</EmptyPanelText>;
  }

  return (
    <div className="space-y-3">
      {rows.map((jurisdiction) => (
        <div
          className="flex items-start justify-between gap-3 rounded-panel border border-line bg-surface-raised p-3"
          key={jurisdiction.id}
        >
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <CountryFlag countryCode={jurisdiction.country.isoCode} countryName={jurisdiction.country.name} />
              <span>{jurisdiction.country.name}</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {jurisdiction.country.tierClassification ?? jurisdiction.country.isoCode}
            </p>
          </div>
          <Badge tone="amber">{jurisdiction.restrictionType.name}</Badge>
        </div>
      ))}
    </div>
  );
}
