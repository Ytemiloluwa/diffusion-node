ALTER TYPE "PolicyStatus" ADD VALUE 'DRAFT';

ALTER TABLE "TimelineEvent" ADD COLUMN "sourceName" TEXT;
ALTER TABLE "TimelineEvent" ADD COLUMN "sourceUrl" TEXT;
