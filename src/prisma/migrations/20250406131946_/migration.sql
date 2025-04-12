/*
  Warnings:

  - The `deviations` column on the `RecoveryAction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "RecoveryAction" DROP COLUMN "deviations",
ADD COLUMN     "deviations" JSONB[];
