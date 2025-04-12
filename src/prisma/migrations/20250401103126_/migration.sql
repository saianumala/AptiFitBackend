/*
  Warnings:

  - The values [CALISTHENICS] on the enum `WorkoutType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorkoutType_new" AS ENUM ('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'ENDURANCE', 'calisthenics', 'HIIT', 'YOGA');
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" DROP DEFAULT;
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" TYPE "WorkoutType_new" USING ("preferredWorkoutType"::text::"WorkoutType_new");
ALTER TYPE "WorkoutType" RENAME TO "WorkoutType_old";
ALTER TYPE "WorkoutType_new" RENAME TO "WorkoutType";
DROP TYPE "WorkoutType_old";
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" SET DEFAULT 'STRENGTH';
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
