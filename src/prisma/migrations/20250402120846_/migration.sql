/*
  Warnings:

  - You are about to drop the column `item` on the `MealPlan` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `DietAdvice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `MealPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DietAdvice" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "item",
ADD COLUMN     "items" JSONB NOT NULL;
