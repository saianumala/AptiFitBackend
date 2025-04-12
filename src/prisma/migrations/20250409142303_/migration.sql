/*
  Warnings:

  - Added the required column `time` to the `ConsumedMeal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConsumedMeal" ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "carbs" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fat" DOUBLE PRECISION,
ADD COLUMN     "fiber" DOUBLE PRECISION,
ADD COLUMN     "ingredients" TEXT[],
ADD COLUMN     "preparation" TEXT,
ADD COLUMN     "protein" DOUBLE PRECISION,
ADD COLUMN     "sodium" DOUBLE PRECISION,
ADD COLUMN     "sugar" DOUBLE PRECISION,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;
