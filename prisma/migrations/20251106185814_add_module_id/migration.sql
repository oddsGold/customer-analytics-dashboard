/*
  Warnings:

  - A unique constraint covering the columns `[moduleId]` on the table `Module` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moduleId` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "moduleId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Module_moduleId_key" ON "Module"("moduleId");
