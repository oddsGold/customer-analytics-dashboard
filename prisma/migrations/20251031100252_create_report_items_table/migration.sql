/*
  Warnings:

  - You are about to drop the column `data` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "data";

-- CreateTable
CREATE TABLE "ReportItem" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "edrpou" TEXT NOT NULL,
    "accountName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "sgCount" INTEGER,
    "licenseStartDate" TIMESTAMP(3),
    "partner" TEXT,
    "goldPartner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReportItem" ADD CONSTRAINT "ReportItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
