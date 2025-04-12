/*
  Warnings:

  - You are about to drop the column `consumed` on the `MealPlan` table. All the data in the column will be lost.
  - You are about to drop the column `consumedAt` on the `MealPlan` table. All the data in the column will be lost.
  - You are about to drop the column `meals` on the `MealPlan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConsumedMeal" DROP CONSTRAINT "ConsumedMeal_mealId_fkey";

-- AlterTable
ALTER TABLE "ConsumedMeal" ALTER COLUMN "details" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "consumed",
DROP COLUMN "consumedAt",
DROP COLUMN "meals";

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "ingredients" JSONB,
    "preparation" JSONB,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumedMeal" ADD CONSTRAINT "ConsumedMeal_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
