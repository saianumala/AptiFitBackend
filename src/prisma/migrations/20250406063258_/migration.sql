/*
  Warnings:

  - You are about to drop the column `duration` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `reps` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `restTime` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `sets` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `date` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "day",
DROP COLUMN "name",
DROP COLUMN "reps",
DROP COLUMN "restTime",
DROP COLUMN "sets",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
