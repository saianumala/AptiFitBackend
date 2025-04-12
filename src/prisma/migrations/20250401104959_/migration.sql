/*
  Warnings:

  - You are about to drop the column `date` on the `BodyMetric` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BodyMetric_userId_date_idx";

-- AlterTable
ALTER TABLE "BodyMetric" DROP COLUMN "date";
