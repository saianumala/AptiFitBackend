/*
  Warnings:

  - A unique constraint covering the columns `[id,date]` on the table `MealPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_id_date_key" ON "MealPlan"("id", "date");
