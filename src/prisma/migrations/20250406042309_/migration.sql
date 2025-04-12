/*
  Warnings:

  - You are about to alter the column `sleepDuration` on the `UserPreferences` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `time` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "time" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "sleepQuality" TEXT,
ADD COLUMN     "sleepTime" TIMESTAMP(3),
ADD COLUMN     "wakeUpTime" TIMESTAMP(3),
ALTER COLUMN "sleepDuration" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;
