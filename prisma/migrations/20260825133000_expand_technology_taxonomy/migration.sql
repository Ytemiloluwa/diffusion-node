ALTER TABLE "TechnologyCategory" ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Technology" ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "IngestionDocument" ADD COLUMN "matchedCategoryNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "IngestionDocument" ADD COLUMN "matchedTechnologyNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
