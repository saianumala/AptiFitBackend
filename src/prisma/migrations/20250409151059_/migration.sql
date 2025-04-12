/*
  Warnings:

  - A unique constraint covering the columns `[mealId]` on the table `ConsumedMeal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ConsumedMeal_mealId_key" ON "ConsumedMeal"("mealId");
