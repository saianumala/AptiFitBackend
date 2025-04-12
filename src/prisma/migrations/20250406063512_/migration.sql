/*
  Warnings:

  - You are about to drop the column `description` on the `WorkoutAdvice` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `WorkoutAdvice` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `WorkoutAdvice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkoutAdvice" DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "name";
