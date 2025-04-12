-- CreateTable
CREATE TABLE "DietAdvice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" TEXT NOT NULL,
    "carbs" TEXT NOT NULL,
    "fats" TEXT NOT NULL,
    "recommendations" TEXT[],

    CONSTRAINT "DietAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutAdvice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "exercises" JSONB NOT NULL,

    CONSTRAINT "WorkoutAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HydrationAdvice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "recommendations" TEXT[],

    CONSTRAINT "HydrationAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepAdvice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "recommendations" TEXT[],

    CONSTRAINT "SleepAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotivationAdvice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tips" TEXT[],

    CONSTRAINT "MotivationAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "dietAdviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DietAdvice" ADD CONSTRAINT "DietAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutAdvice" ADD CONSTRAINT "WorkoutAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HydrationAdvice" ADD CONSTRAINT "HydrationAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepAdvice" ADD CONSTRAINT "SleepAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotivationAdvice" ADD CONSTRAINT "MotivationAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_dietAdviceId_fkey" FOREIGN KEY ("dietAdviceId") REFERENCES "DietAdvice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
