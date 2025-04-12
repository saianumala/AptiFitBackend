/*
  Warnings:

  - You are about to drop the column `dailyPlanId` on the `ConsumedMeal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConsumedMeal" DROP CONSTRAINT "ConsumedMeal_dailyPlanId_fkey";

-- AlterTable
ALTER TABLE "ConsumedMeal" DROP COLUMN "dailyPlanId",
ADD COLUMN     "mealId" TEXT;

-- AlterTable
ALTER TABLE "MealPlan" ADD COLUMN     "consumed" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "ConsumedMeal" ADD CONSTRAINT "ConsumedMeal_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "MealPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
