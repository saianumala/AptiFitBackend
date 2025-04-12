/*
  Warnings:

  - You are about to drop the column `carbohydrates` on the `DietAdvice` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `DietAdvice` table. All the data in the column will be lost.
  - Added the required column `macronutrients` to the `DietAdvice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DietAdvice" DROP COLUMN "carbohydrates",
DROP COLUMN "protein",
ADD COLUMN     "macronutrients" JSONB NOT NULL;
