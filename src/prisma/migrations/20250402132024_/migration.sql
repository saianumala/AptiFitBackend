/*
  Warnings:

  - You are about to drop the column `items` on the `MealPlan` table. All the data in the column will be lost.
  - Changed the type of `meal` on the `MealPlan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "items",
DROP COLUMN "meal",
ADD COLUMN     "meal" JSONB NOT NULL;
