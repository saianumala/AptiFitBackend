/*
  Warnings:

  - You are about to drop the `UserFitnessData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserFitnessData" DROP CONSTRAINT "UserFitnessData_userId_fkey";

-- DropTable
DROP TABLE "UserFitnessData";

-- DropEnum
DROP TYPE "DietType";

-- DropEnum
DROP TYPE "FitnessGoal";

-- DropEnum
DROP TYPE "WorkoutDuration";

-- DropEnum
DROP TYPE "WorkoutFrequency";

-- DropEnum
DROP TYPE "WorkoutType";

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationFrequency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "doNotDisturbStart" TEXT,
    "doNotDisturbEnd" TEXT,
    "preferredWorkoutTypes" TEXT[],
    "healthGoalFocus" TEXT[],
    "dietaryRestrictions" TEXT[],
    "coachingIntensity" TEXT NOT NULL DEFAULT 'BALANCED',
    "motivationStyle" TEXT NOT NULL DEFAULT 'SUPPORTIVE',
    "weightUnit" TEXT NOT NULL DEFAULT 'KG',
    "heightUnit" TEXT NOT NULL DEFAULT 'CM',
    "distanceUnit" TEXT NOT NULL DEFAULT 'KM',
    "energyUnit" TEXT NOT NULL DEFAULT 'KCAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
