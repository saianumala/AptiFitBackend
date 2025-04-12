/*
  Warnings:

  - You are about to drop the column `fistLogin` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "fistLogin",
ADD COLUMN     "firstLogin" BOOLEAN NOT NULL DEFAULT true;
