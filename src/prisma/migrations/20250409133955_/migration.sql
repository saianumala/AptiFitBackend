/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `MealPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MealPlan_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_userId_date_key" ON "MealPlan"("userId", "date");
