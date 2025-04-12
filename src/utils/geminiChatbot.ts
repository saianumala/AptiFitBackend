import { DateTime } from "luxon";
import prisma from "../prisma";

export async function generateUserContext({
  userData,
}: {
  userData: {
    userId: string;
    timeZone: string;
    email: string;
  };
}): Promise<string> {
  // Query DB for latest meals, workouts, goals, etc.
  const todayStart =
    DateTime.now().setZone(userData.timeZone).startOf("day").toISO() ||
    new Date(new Date().setHours(0, 0, 0, 0));
  const userId = userData.userId;
  // const todayStart = new Date();
  // todayStart.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      userPreferences: true,

      MealPlan: {
        where: { date: todayStart },
        include: { meals: true },
      },

      bodyMetrics: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },

      RecoveryActions: {
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { consumedMeal: true },
      },

      ConsumedMeals: {
        where: {
          createdAt: {
            gte: todayStart, // today's meals
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5, // adjust as needed
      },

      WorkoutAdvice: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          workouts: true,
        },
      },
    },
  });
  console.log(user);
  console.log(JSON.stringify(user));
  return `
      You are a helpful health and fitness assistant. Your goal is to provide informative, personalized, and actionable responses based on the user's provided profile and their current message.
      Here is the user's profile information
      User Preferences:
      ${JSON.stringify(user?.userPreferences)}
      Body Metrics:
      ${JSON.stringify(user?.bodyMetrics)}
      Meal Plan:
      ${JSON.stringify(user?.MealPlan)}
      Consumed Meals:
      ${JSON.stringify(user?.ConsumedMeals)}
      Workout Advice:
      ${JSON.stringify(user?.WorkoutAdvice)}
      Recovery Actions:
      ${JSON.stringify(user?.RecoveryActions)}
Current Time: ${DateTime.now().setZone(userData.timeZone)}

    `;
}
generateUserContext({
  userData: {
    userId: "6b4094a0-15dc-4957-8c37-c542272b9585",
    email: "asfasf",
    timeZone: "Asia/Calcutta",
  },
});
// Recent Meals:
// ${user?.MealPlan.map(
//   (meals) => `- ${m.type} at ${m.time}: ${m.name}`
// ).join("\n")}

// Workout Plan:
// ${workouts.map((w) => `- ${w.type} at ${w.time}`).join("\n")}
