/*
  Warnings:

  - You are about to drop the column `carbs` on the `DietAdvice` table. All the data in the column will be lost.
  - Added the required column `carbohydrates` to the `DietAdvice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item` to the `MealPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DietAdvice" DROP COLUMN "carbs",
ADD COLUMN     "carbohydrates" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MealPlan" ADD COLUMN     "item" TEXT NOT NULL;
