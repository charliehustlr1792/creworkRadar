-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "stage" TEXT,
    "sizeEstimate" TEXT,
    "description" TEXT,
    "intentScore" INTEGER NOT NULL DEFAULT 0,
    "scoreBreakdown" JSONB,
    "signalCount" INTEGER NOT NULL DEFAULT 1,
    "whyFlagged" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "rawText" TEXT,
    "url" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_intentScore_idx" ON "Company"("intentScore");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "Signal_companyId_idx" ON "Signal"("companyId");

-- CreateIndex
CREATE INDEX "Signal_signalType_idx" ON "Signal"("signalType");

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

