/*
  Warnings:

  - You are about to drop the column `meals` on the `MealPlan` table. All the data in the column will be lost.
  - Added the required column `meal` to the `MealPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "meals",
ADD COLUMN     "meal" TEXT NOT NULL,
ALTER COLUMN "date" DROP DEFAULT;
