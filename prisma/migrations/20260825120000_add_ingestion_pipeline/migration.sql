CREATE TYPE "IngestionSourceType" AS ENUM ('FEDERAL_REGISTER_API');

CREATE TYPE "IngestionRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

CREATE TYPE "IngestionDocumentStatus" AS ENUM ('NEW', 'REVIEWED', 'IMPORTED', 'SKIPPED');

CREATE TABLE "IngestionSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "IngestionSourceType" NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "IngestionRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "documentsFound" INTEGER NOT NULL DEFAULT 0,
    "documentsCreated" INTEGER NOT NULL DEFAULT 0,
    "documentsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngestionDocument" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "runId" TEXT,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "documentType" TEXT,
    "htmlUrl" TEXT,
    "pdfUrl" TEXT,
    "publicationDate" TIMESTAMP(3),
    "agencyNames" TEXT[],
    "matchedTerms" TEXT[],
    "rawPayload" JSONB NOT NULL,
    "status" "IngestionDocumentStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IngestionSource_sourceType_name_key" ON "IngestionSource"("sourceType", "name");

CREATE UNIQUE INDEX "IngestionDocument_sourceId_externalId_key" ON "IngestionDocument"("sourceId", "externalId");

CREATE INDEX "IngestionDocument_publicationDate_idx" ON "IngestionDocument"("publicationDate");

CREATE INDEX "IngestionDocument_status_idx" ON "IngestionDocument"("status");

ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IngestionSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IngestionDocument" ADD CONSTRAINT "IngestionDocument_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IngestionSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IngestionDocument" ADD CONSTRAINT "IngestionDocument_runId_fkey" FOREIGN KEY ("runId") REFERENCES "IngestionRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
