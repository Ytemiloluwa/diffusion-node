export type Role = 'ADMIN' | 'DEVELOPER';

export type PolicyStatus = 'ACTIVE' | 'CONTESTED' | 'DRAFT' | 'RESCINDED' | 'SUPERSEDED';

export type ApiResponse<T> = {
  data: T;
};

export type PageInfo = {
  hasNextPage: boolean;
  limit: number;
  nextCursor: string | null;
};

export type CursorPage<T> = {
  data: T[];
  pageInfo: PageInfo;
};

export type CursorPaginationQuery = {
  cursor?: string;
  limit?: number;
};

export type ApiError = {
  code: string;
  details?: unknown;
  message: string;
};

export type ApiErrorResponse = {
  error: ApiError;
};

export type User = {
  createdAt: string;
  email: string;
  id: string;
  role: Role;
};

export type ApiKeyCredential = {
  createdAt: string;
  id: string;
  key: string;
  label: string;
};

export type ApiKeySummary = {
  createdAt: string;
  id: string;
  label: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type UserProfile = User & {
  apiKeys: ApiKeySummary[];
};

export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RefreshTokenResponse = {
  accessToken: string;
};

export type Country = {
  id: string;
  isoCode: string;
  name: string;
  tierClassification: string | null;
};

export type RestrictionType = {
  description: string | null;
  id: string;
  name: string;
};

export type Jurisdiction = {
  country: Country;
  countryId: string;
  id: string;
  policyId: string;
  restrictionType: RestrictionType;
  restrictionTypeId: string;
};

export type CountryWithRestrictionSummary = Country & {
  jurisdictions: Array<{
    restrictionType: RestrictionType;
  }>;
  restrictionSummary: Record<string, number>;
};

export type TechnologyCategory = {
  _count?: {
    technologies: number;
  };
  aliases: string[];
  id: string;
  isActiveInV1: boolean;
  name: string;
};

export type Technology = {
  aliases: string[];
  category: TechnologyCategory;
  categoryId: string;
  description: string | null;
  id: string;
  name: string;
};

export type Company = {
  aliases: string[];
  entityListStatus: string | null;
  hqCountry: Country;
  hqCountryId: string;
  id: string;
  name: string;
};

export type PolicySource = {
  id: string;
  policyId: string;
  publishedDate: string | null;
  sourceName: string;
  sourceUrl: string | null;
};

export type Document = {
  documentType: string;
  id: string;
  policyId: string;
  publishedDate: string | null;
  title: string;
  url: string | null;
};

export type PolicyTechnology = {
  createdAt: string;
  id: string;
  policyId: string;
  technology: Technology;
  technologyId: string;
};

export type PolicyCompany = {
  company: Company;
  companyId: string;
  createdAt: string;
  id: string;
  policyId: string;
};

export type Policy = {
  companies: PolicyCompany[];
  controlNumber: string | null;
  createdAt: string;
  documents: Document[];
  effectiveDate: string | null;
  id: string;
  jurisdictions: Jurisdiction[];
  sources: PolicySource[];
  status: PolicyStatus;
  summary: string | null;
  technologies: PolicyTechnology[];
  title: string;
  updatedAt: string;
};

export type PolicyRevision = {
  changeSummary: string | null;
  id: string;
  newStatus: PolicyStatus | null;
  policyId: string;
  previousStatus: PolicyStatus | null;
  revisionDate: string;
};

export type TimelineEvent = {
  description: string | null;
  eventDate: string;
  eventType: string;
  id: string;
  policyId: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
};

export type PolicyDetail = Policy & {
  revisions: PolicyRevision[];
  timelineEvents: TimelineEvent[];
};

export type PolicyTimelineItem =
  | {
      changeSummary: string | null;
      date: string;
      id: string;
      newStatus: PolicyStatus | null;
      previousStatus: PolicyStatus | null;
      type: 'revision';
    }
  | {
      date: string;
      description: string | null;
      eventType: string;
      id: string;
      sourceName: string | null;
      sourceUrl: string | null;
      type: 'event';
    };

export type TimelineEventWithPolicy = TimelineEvent & {
  policy: {
    controlNumber: string | null;
    id: string;
    status: PolicyStatus;
    title: string;
  } | null;
};

export type PolicySearchQuery = CursorPaginationQuery & {
  company?: string;
  country?: string;
  q?: string;
  restriction?: string;
  source?: string;
  technology?: string;
  title?: string;
  year?: number;
};

export type TechnologiesQuery = CursorPaginationQuery & {
  category?: string;
};

export type CompaniesQuery = CursorPaginationQuery & {
  country?: string;
  entityListStatus?: string;
};

export type SourceSummary = {
  sourceName: string;
};
