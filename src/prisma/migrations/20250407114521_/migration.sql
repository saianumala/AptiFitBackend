/*
  Warnings:

  - The `notificationFrequency` column on the `UserPreferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "notificationFrequency",
ADD COLUMN     "notificationFrequency" INTEGER;
