/*
  Warnings:

  - The values [flexibility,balance] on the enum `WorkoutType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "ActivityLevel" ADD VALUE 'moderate';

-- AlterEnum
BEGIN;
CREATE TYPE "WorkoutType_new" AS ENUM ('strength', 'cardio', 'endurance', 'calisthenics', 'hiit', 'yoga');
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" DROP DEFAULT;
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" TYPE "WorkoutType_new" USING ("preferredWorkoutType"::text::"WorkoutType_new");
ALTER TYPE "WorkoutType" RENAME TO "WorkoutType_old";
ALTER TYPE "WorkoutType_new" RENAME TO "WorkoutType";
DROP TYPE "WorkoutType_old";
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" SET DEFAULT 'strength';
COMMIT;
