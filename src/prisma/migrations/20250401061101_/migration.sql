/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `distanceUnit` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `doNotDisturbEnd` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `doNotDisturbStart` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `energyUnit` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `heightUnit` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `preferredWorkoutTypes` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `weightUnit` on the `UserPreferences` table. All the data in the column will be lost.
  - The `notificationFrequency` column on the `UserPreferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `coachingIntensity` column on the `UserPreferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `motivationStyle` column on the `UserPreferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityLevel` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "CoachingIntensity" AS ENUM ('GENTLE', 'BALANCED', 'INTENSE');

-- CreateEnum
CREATE TYPE "MotivationStyle" AS ENUM ('SUPPORTIVE', 'CHALLENGING', 'DATA_DRIVEN');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('CONTINUOUS', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'ENDURANCE', 'CALISTHENICS', 'HIIT', 'YOGA');

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "distanceUnit",
DROP COLUMN "doNotDisturbEnd",
DROP COLUMN "doNotDisturbStart",
DROP COLUMN "energyUnit",
DROP COLUMN "heightUnit",
DROP COLUMN "preferredWorkoutTypes",
DROP COLUMN "weightUnit",
ADD COLUMN     "activityLevel" "ActivityLevel" NOT NULL,
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "caloriesBurned" DOUBLE PRECISION,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "heartRate" INTEGER,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "preferredWorkoutType" "WorkoutType" NOT NULL DEFAULT 'STRENGTH',
ADD COLUMN     "sleepDuration" DOUBLE PRECISION,
ADD COLUMN     "stepsDaily" INTEGER,
ADD COLUMN     "waistCircumference" DOUBLE PRECISION,
ADD COLUMN     "waterIntake" DOUBLE PRECISION,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL,
DROP COLUMN "notificationFrequency",
ADD COLUMN     "notificationFrequency" "NotificationFrequency" NOT NULL DEFAULT 'MEDIUM',
ALTER COLUMN "healthGoalFocus" SET NOT NULL,
ALTER COLUMN "healthGoalFocus" SET DATA TYPE TEXT,
ALTER COLUMN "dietaryRestrictions" DROP NOT NULL,
ALTER COLUMN "dietaryRestrictions" SET DATA TYPE TEXT,
DROP COLUMN "coachingIntensity",
ADD COLUMN     "coachingIntensity" "CoachingIntensity" NOT NULL DEFAULT 'BALANCED',
DROP COLUMN "motivationStyle",
ADD COLUMN     "motivationStyle" "MotivationStyle" NOT NULL DEFAULT 'SUPPORTIVE';

-- CreateTable
CREATE TABLE "BodyMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bmi" DOUBLE PRECISION,
    "bmr" DOUBLE PRECISION,
    "tdee" DOUBLE PRECISION,
    "bodyFatPercentage" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "boneMass" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BodyMetric_userId_date_idx" ON "BodyMetric"("userId", "date");

-- AddForeignKey
ALTER TABLE "BodyMetric" ADD CONSTRAINT "BodyMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
