-- CreateEnum
CREATE TYPE "FitnessGoal" AS ENUM ('LOSE_WEIGHT', 'GAIN_MUSCLE', 'STAY_FIT');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('CARDIO', 'STRENGTH', 'YOGA', 'MIXED');

-- CreateEnum
CREATE TYPE "DietType" AS ENUM ('VEGAN', 'KETO', 'BALANCED');

-- CreateEnum
CREATE TYPE "WorkoutFrequency" AS ENUM ('ONCE_A_WEEK', 'TWICE_A_WEEK', 'THREE_TIMES_A_WEEK', 'FOUR_TIMES_A_WEEK', 'FIVE_TIMES_A_WEEK', 'SIX_TIMES_A_WEEK', 'DAILY');

-- CreateEnum
CREATE TYPE "WorkoutDuration" AS ENUM ('SHORT', 'MEDIUM', 'LONG');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserFitnessData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "fitnessGoal" "FitnessGoal" NOT NULL,
    "workoutFreq" "WorkoutFrequency" NOT NULL,
    "workoutType" "WorkoutType" NOT NULL,
    "workoutDuration" "WorkoutDuration" NOT NULL,
    "dietType" "DietType",
    "calorieTracking" BOOLEAN NOT NULL DEFAULT false,
    "sleepHours" DOUBLE PRECISION,
    "waterIntake" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFitnessData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserFitnessData_userId_key" ON "UserFitnessData"("userId");

-- AddForeignKey
ALTER TABLE "UserFitnessData" ADD CONSTRAINT "UserFitnessData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
