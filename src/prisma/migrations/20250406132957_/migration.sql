-- AlterTable
ALTER TABLE "RecoveryAction" ADD COLUMN     "consumedMealId" TEXT;

-- AddForeignKey
ALTER TABLE "RecoveryAction" ADD CONSTRAINT "RecoveryAction_consumedMealId_fkey" FOREIGN KEY ("consumedMealId") REFERENCES "ConsumedMeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
