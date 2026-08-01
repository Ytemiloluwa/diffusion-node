-- CreateTable
CREATE TABLE "PolicyTechnology" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyCompany" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyTechnology_policyId_technologyId_key" ON "PolicyTechnology"("policyId", "technologyId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyCompany_policyId_companyId_key" ON "PolicyCompany"("policyId", "companyId");

-- AddForeignKey
ALTER TABLE "PolicyTechnology" ADD CONSTRAINT "PolicyTechnology_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyTechnology" ADD CONSTRAINT "PolicyTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyCompany" ADD CONSTRAINT "PolicyCompany_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyCompany" ADD CONSTRAINT "PolicyCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
