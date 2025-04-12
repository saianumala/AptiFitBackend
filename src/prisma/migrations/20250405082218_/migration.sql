/*
  Warnings:

  - You are about to drop the column `dietAdviceId` on the `MealPlan` table. All the data in the column will be lost.
  - You are about to drop the column `meal` on the `MealPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date]` on the table `MealPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `meals` to the `MealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `WorkoutAdvice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `WorkoutAdvice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WorkoutAdvice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('MEAL_DEVIATION', 'WORKOUT_MISSED');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');

-- DropForeignKey
ALTER TABLE "MealPlan" DROP CONSTRAINT "MealPlan_dietAdviceId_fkey";

-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "dietAdviceId",
DROP COLUMN "meal",
ADD COLUMN     "meals" JSONB NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "cuisine" TEXT;

-- AlterTable
ALTER TABLE "WorkoutAdvice" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ConsumedMeal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyPlanId" TEXT,
    "mealType" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "isFromPlan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsumedMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "skippedExercises" TEXT[],
    "notes" TEXT,
    "duration" INTEGER,
    "intensity" TEXT,
    "recoveryPlan" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "actions" JSONB NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "actions" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsumedMeal_userId_createdAt_idx" ON "ConsumedMeal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_date_idx" ON "WorkoutLog"("userId", "date");

-- CreateIndex
CREATE INDEX "RecoveryAction_userId_status_idx" ON "RecoveryAction"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_date_key" ON "MealPlan"("date");

-- CreateIndex
CREATE INDEX "WorkoutAdvice_userId_active_idx" ON "WorkoutAdvice"("userId", "active");

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumedMeal" ADD CONSTRAINT "ConsumedMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumedMeal" ADD CONSTRAINT "ConsumedMeal_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "MealPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryAction" ADD CONSTRAINT "RecoveryAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
