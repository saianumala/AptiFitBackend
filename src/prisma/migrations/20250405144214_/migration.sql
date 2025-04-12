/*
  Warnings:

  - The `ingredients` column on the `Meal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `exercises` on the `WorkoutAdvice` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `intensity` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryPlan` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `skippedExercises` on the `WorkoutLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workoutId,userId,date]` on the table `WorkoutLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workoutId` to the `WorkoutLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "WorkoutLog_userId_date_idx";

-- AlterTable
ALTER TABLE "Meal" DROP COLUMN "ingredients",
ADD COLUMN     "ingredients" TEXT[],
ALTER COLUMN "preparation" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "WorkoutAdvice" DROP COLUMN "exercises";

-- AlterTable
ALTER TABLE "WorkoutLog" DROP COLUMN "duration",
DROP COLUMN "intensity",
DROP COLUMN "notes",
DROP COLUMN "planId",
DROP COLUMN "recoveryPlan",
DROP COLUMN "skippedExercises",
ADD COLUMN     "workoutId" TEXT NOT NULL,
ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "completed" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "workoutAdviceId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetMuscles" TEXT[],
    "duration" INTEGER NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "restTime" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutLog_workoutId_userId_date_key" ON "WorkoutLog"("workoutId", "userId", "date");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_workoutAdviceId_fkey" FOREIGN KEY ("workoutAdviceId") REFERENCES "WorkoutAdvice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
