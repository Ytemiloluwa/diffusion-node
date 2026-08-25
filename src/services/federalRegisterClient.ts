export const FEDERAL_REGISTER_DOCUMENTS_URL =
  'https://www.federalregister.gov/api/v1/documents.json';

export type FederalRegisterSearchQuery = {
  agencies?: string[];
  baseUrl?: string;
  limit?: number;
  publicationDateGte?: string;
  terms: string[];
};

export type FetchLike = (
  input: string | URL,
  init?: {
    headers?: Record<string, string>;
  },
) => Promise<{
  json: () => Promise<unknown>;
  ok: boolean;
  status: number;
}>;

export type FederalRegisterAgency = {
  name?: string;
  raw_name?: string;
};

export type FederalRegisterDocument = {
  abstract?: string | null;
  agencies?: FederalRegisterAgency[];
  document_number: string;
  html_url?: string | null;
  pdf_url?: string | null;
  publication_date?: string | null;
  title: string;
  type?: string | null;
};

type FederalRegisterDocumentsResponse = {
  count?: number;
  results?: FederalRegisterDocument[];
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const normalizeFederalRegisterLimit = (limit?: number): number => {
  if (!limit || !Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
};

export const buildFederalRegisterDocumentsUrl = ({
  agencies = [],
  baseUrl = FEDERAL_REGISTER_DOCUMENTS_URL,
  limit,
  publicationDateGte,
  terms,
}: FederalRegisterSearchQuery): URL => {
  const url = new URL(baseUrl);
  const normalizedTerms = terms.map((term) => term.trim()).filter(Boolean);

  url.searchParams.set('order', 'newest');
  url.searchParams.set('per_page', String(normalizeFederalRegisterLimit(limit)));

  if (normalizedTerms.length) {
    url.searchParams.set('conditions[term]', normalizedTerms.join(' '));
  }

  if (publicationDateGte) {
    url.searchParams.set('conditions[publication_date][gte]', publicationDateGte);
  }

  agencies
    .map((agency) => agency.trim())
    .filter(Boolean)
    .forEach((agency) => {
      url.searchParams.append('conditions[agencies][]', agency);
    });

  return url;
};

export const fetchFederalRegisterDocuments = async (
  query: FederalRegisterSearchQuery,
  fetchImpl: FetchLike = globalThis.fetch,
): Promise<FederalRegisterDocument[]> => {
  const response = await fetchImpl(buildFederalRegisterDocumentsUrl(query), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Federal Register request failed with status ${response.status}.`);
  }

  const body = (await response.json()) as FederalRegisterDocumentsResponse;

  return body.results ?? [];
};
