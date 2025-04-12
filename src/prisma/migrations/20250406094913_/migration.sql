/*
  Warnings:

  - Changed the type of `date` on the `MealPlan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "date",
ADD COLUMN     "date" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_date_key" ON "MealPlan"("date");
