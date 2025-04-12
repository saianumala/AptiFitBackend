/*
  Warnings:

  - The values [SEDENTARY,LIGHTLY_ACTIVE,ACTIVE,VERY_ACTIVE] on the enum `ActivityLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [GENTLE,BALANCED,INTENSE] on the enum `CoachingIntensity` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPPORTIVE,CHALLENGING,DATA_DRIVEN] on the enum `MotivationStyle` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONTINUOUS,HIGH,MEDIUM,LOW,MINIMAL] on the enum `NotificationFrequency` will be removed. If these variants are still used in the database, this will fail.
  - The values [STRENGTH,CARDIO,FLEXIBILITY,BALANCE,ENDURANCE,HIIT,YOGA] on the enum `WorkoutType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityLevel_new" AS ENUM ('sedentary', 'lightly_active', 'active', 'very_active');
ALTER TABLE "UserPreferences" ALTER COLUMN "activityLevel" TYPE "ActivityLevel_new" USING ("activityLevel"::text::"ActivityLevel_new");
ALTER TYPE "ActivityLevel" RENAME TO "ActivityLevel_old";
ALTER TYPE "ActivityLevel_new" RENAME TO "ActivityLevel";
DROP TYPE "ActivityLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CoachingIntensity_new" AS ENUM ('gentle', 'balanced', 'intens');
ALTER TABLE "UserPreferences" ALTER COLUMN "coachingIntensity" DROP DEFAULT;
ALTER TABLE "UserPreferences" ALTER COLUMN "coachingIntensity" TYPE "CoachingIntensity_new" USING ("coachingIntensity"::text::"CoachingIntensity_new");
ALTER TYPE "CoachingIntensity" RENAME TO "CoachingIntensity_old";
ALTER TYPE "CoachingIntensity_new" RENAME TO "CoachingIntensity";
DROP TYPE "CoachingIntensity_old";
ALTER TABLE "UserPreferences" ALTER COLUMN "coachingIntensity" SET DEFAULT 'balanced';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MotivationStyle_new" AS ENUM ('supportive', 'challenging', 'data_driven');
ALTER TABLE "UserPreferences" ALTER COLUMN "motivationStyle" DROP DEFAULT;
ALTER TABLE "UserPreferences" ALTER COLUMN "motivationStyle" TYPE "MotivationStyle_new" USING ("motivationStyle"::text::"MotivationStyle_new");
ALTER TYPE "MotivationStyle" RENAME TO "MotivationStyle_old";
ALTER TYPE "MotivationStyle_new" RENAME TO "MotivationStyle";
DROP TYPE "MotivationStyle_old";
ALTER TABLE "UserPreferences" ALTER COLUMN "motivationStyle" SET DEFAULT 'supportive';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationFrequency_new" AS ENUM ('continuous', 'high', 'medium', 'low', 'minimal');
ALTER TABLE "UserPreferences" ALTER COLUMN "notificationFrequency" DROP DEFAULT;
ALTER TABLE "UserPreferences" ALTER COLUMN "notificationFrequency" TYPE "NotificationFrequency_new" USING ("notificationFrequency"::text::"NotificationFrequency_new");
ALTER TYPE "NotificationFrequency" RENAME TO "NotificationFrequency_old";
ALTER TYPE "NotificationFrequency_new" RENAME TO "NotificationFrequency";
DROP TYPE "NotificationFrequency_old";
ALTER TABLE "UserPreferences" ALTER COLUMN "notificationFrequency" SET DEFAULT 'medium';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WorkoutType_new" AS ENUM ('strength', 'cardio', 'flexibility', 'balance', 'endurance', 'calisthenics', 'hiit', 'yoga');
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" DROP DEFAULT;
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" TYPE "WorkoutType_new" USING ("preferredWorkoutType"::text::"WorkoutType_new");
ALTER TYPE "WorkoutType" RENAME TO "WorkoutType_old";
ALTER TYPE "WorkoutType_new" RENAME TO "WorkoutType";
DROP TYPE "WorkoutType_old";
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" SET DEFAULT 'strength';
COMMIT;

-- AlterTable
ALTER TABLE "UserPreferences" ALTER COLUMN "preferredWorkoutType" SET DEFAULT 'strength',
ALTER COLUMN "notificationFrequency" SET DEFAULT 'medium',
ALTER COLUMN "coachingIntensity" SET DEFAULT 'balanced',
ALTER COLUMN "motivationStyle" SET DEFAULT 'supportive';
