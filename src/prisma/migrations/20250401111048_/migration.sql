/*
  Warnings:

  - The values [intens] on the enum `CoachingIntensity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CoachingIntensity_new" AS ENUM ('gentle', 'balanced', 'intense');
ALTER TABLE "UserPreferences" ALTER COLUMN "coachingIntensity" DROP DEFAULT;
ALTER TABLE "UserPreferences" ALTER COLUMN "coachingIntensity" TYPE "CoachingIntensity_new" USING ("coachingIntensity"::text::"CoachingIntensity_new");
ALTER TYPE "CoachingIntensity" RENAME TO "CoachingIntensity_old";
ALTER TYPE "CoachingIntensity_new" RENAME TO "CoachingIntensity";
DROP TYPE "CoachingIntensity_old";
ALTER TABLE "UserPreferences" ALTER COLUMN "coachingIntensity" SET DEFAULT 'balanced';
COMMIT;
