/*
  Warnings:

  - You are about to drop the column `tips` on the `MotivationAdvice` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `SleepAdvice` table. All the data in the column will be lost.
  - Added the required column `adjustment` to the `HydrationAdvice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current` to the `HydrationAdvice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progress` to the `HydrationAdvice` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `target` on the `HydrationAdvice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recommendations` on the `HydrationAdvice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `strategies` to the `MotivationAdvice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current` to the `SleepAdvice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `improvement` to the `SleepAdvice` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `target` on the `SleepAdvice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "HydrationAdvice" ADD COLUMN     "adjustment" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current" JSONB NOT NULL,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL,
DROP COLUMN "target",
ADD COLUMN     "target" JSONB NOT NULL,
DROP COLUMN "recommendations",
ADD COLUMN     "recommendations" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "MotivationAdvice" DROP COLUMN "tips",
ADD COLUMN     "boosters" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recovery" TEXT[],
ADD COLUMN     "strategies" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "SleepAdvice" DROP COLUMN "recommendations",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current" JSONB NOT NULL,
ADD COLUMN     "improvement" JSONB NOT NULL,
ADD COLUMN     "recovery" TEXT[],
DROP COLUMN "target",
ADD COLUMN     "target" JSONB NOT NULL;
