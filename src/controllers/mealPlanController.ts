import { Request, Response } from "express";
import prisma from "../prisma";
import { generateWithAI } from "../utils/personalisedAi";
import { Prisma } from "@prisma/client";
import { sendNotification } from "web-push";
// import { sendNotifications } from "../notifications/sendNotification";
import { getUserLocalDate } from "../utils/getLocalTime";
import { DateTime } from "luxon";

// export const mealDataSchema = z.object({
//   name: z.string().min(1, "Meal name is required"),

//   description: z.string().optional(),

//   type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),

//   calories: z.number().positive("Calories must be greater than 0").optional(),

//   protein: z.number().min(0, "Protein cannot be negative").optional(),

//   carbs: z.number().min(0, "Carbs cannot be negative").optional(),

//   fat: z.number().min(0, "Fat cannot be negative").optional(),

//   fiber: z.number().min(0, "Fiber cannot be negative").optional(),

//   sugar: z.number().min(0, "Sugar cannot be negative").optional(),

//   sodium: z.number().min(0, "Sodium cannot be negative").optional(),

//   ingredients: z.array(z.string().min(1)).optional(),

//   preparation: z.string().optional(),
// });

// export interface mealInputData {
//   name: string;
//   time?: string;
//   description?: string;
//   type?: "breakfast" | "lunch" | "dinner" | "snack";
//   calories?: number; // must be > 0
//   protein?: number;  // >= 0
//   carbs?: number;    // >= 0
//   fat?: number;      // >= 0
//   fiber?: number;    // >= 0
//   sugar?: number;    // >= 0
//   sodium?: number;   // >= 0
//   ingredients?: string[];
//   preparation?: string;
// }

export const generateDailyPlan = async (req: Request, res: Response) => {
  try {
    // console.log("todays date", today);
    const { timeZone } = req.body;
    const localTime = getUserLocalDate({
      timezone: timeZone,
      usersDefaultZone: req.user?.timeZone,
    });
    // 1. Generate AI Plan BEFORE the transaction
    console.log(typeof localTime);
    console.log(localTime);
    console.log(new Date());
    const plan = await generateWithAI({
      userId: req.user?.userId,
      taskType: "meal-plan",
    });

    // 2. Start transaction
    const createdPlan = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Delete unconsumed meals
        const existingPlan = await tx.mealPlan.findUnique({
          where: {
            userId_date: {
              userId: req.user?.userId,
              date: localTime,
            },
          },
          include: { meals: true },
        });

        if (existingPlan) {
          const unconsumedIds = existingPlan.meals
            .filter((meal: any) => !meal.consumed)
            .map((meal: any) => meal.id);

          if (unconsumedIds.length > 0) {
            await tx.meal.deleteMany({
              where: { id: { in: unconsumedIds } },
            });
          }
          const remaining = existingPlan.meals.filter(
            (meal: any) => meal.consumed
          );
          console.log("remaining", remaining);
          return await tx.mealPlan.update({
            where: {
              id: existingPlan?.id,
            },
            data: {
              meals: {
                create: plan.meals.map((meal: any) => ({
                  name: meal.name,
                  description: meal.description,
                  type: meal.type,
                  calories: meal.calories,
                  protein: meal.protein,
                  carbs: meal.carbs,
                  fat: meal.fat,
                  fiber: meal.fiber,
                  sugar: meal.sugar,
                  sodium: meal.sodium,
                  ingredients: meal.ingredients,
                  preparation: meal.preparation,
                  consumed: false,
                })),
              },
            },

            include: { meals: true },
          });
        }

        // Create new meal plan
        return await tx.mealPlan.create({
          data: {
            userId: req.user?.userId,
            date: localTime,
            meals: {
              create: plan.meals.map((meal: any) => ({
                name: meal.name,
                description: meal.description,
                type: meal.type,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat,
                fiber: meal.fiber,
                sugar: meal.sugar,
                sodium: meal.sodium,
                ingredients: meal.ingredients,
                preparation: meal.preparation,
                consumed: false,
              })),
            },
          },
          include: { meals: true },
        });
      }
    );

    // 3. Notification logic after DB operations
    const user = await prisma.user.findFirst({
      where: { userId: req.user?.userId },
      select: {
        subscription: {
          omit: {
            userId: true,
            id: true,
          },
        },
      },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: req.user?.userId,
        title: "New Meal Plan Generated",
        message: "Your personalized meal plan is ready!",
        type: "meal_plan_created",
        referenceId: createdPlan.id,
      },
    });

    // await sendNotifications({
    //   subscription: user?.subscription,
    //   payload: { ...notification, title: "New Meal Plan Generated" },
    // });

    res.status(201).json({ newMealPlan: createdPlan });
  } catch (error) {
    console.error("Plan generation failed:", error);
    res.status(500).json({ error: "Plan generation failed", err: error });
  }
};

export const getCurrentPlan = async (req: Request, res: Response) => {
  try {
    const { timeZone } = req.body;
    const localTime = getUserLocalDate({
      timezone: timeZone,
      usersDefaultZone: req.user?.timeZone,
    });
    const plan = await prisma.mealPlan.findFirst({
      where: {
        userId: req.user?.userId,
        date: localTime,
      },
      include: {
        meals: true,
      },
    });
    res.json(plan || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch plan" });
  }
};

// export const getPlanHistory = async (req: Request, res: Response) => {
//   try {
//     const { days = 7 } = req.query;
//     const date = new Date();
//     date.setHours(0,0,0,0)
//     // date.setDate(date.getDate() - Number(days));

//     const plans = await prisma.mealPlan.findMany({
//       where: {
//         userId: req.user?.userId,
//         date: { gte: date },
//       },
//       include: {
//         meals: true,
//       },
//       orderBy: { date: "desc" },
//     });
//     res.json(plans);
//   } catch (error) {
//     res.status(500).json({ error: "History fetch failed" });
//   }
// };

export const trackMealConsumption = async (req: Request, res: Response) => {
  try {
    console.log("reached track meal");
    console.log(req.body);
    const { mealId } = req.body;
    const { timeZone } = req.body;
    const zone = timeZone || req.user?.timeZone || "UTC";
    const usersLocalTIme = DateTime.now().setZone(zone).toISO();

    console.log(mealId);
    console.log(usersLocalTIme);
    // Update the meal in the meal plan to mark it as consumed
    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        consumed: true,
        consumedAt: usersLocalTIme || new Date().toISOString(),
      },
      include: {
        mealPlan: {
          include: {
            meals: true,
            user: {
              select: {
                subscription: true,
              },
            },
          },
          // {

          // },
        },
      },
    });

    // Create consumed meal record
    const consumedMeal = await prisma.consumedMeal.create({
      data: {
        userId: req.user?.userId,
        mealId: updatedMeal.id,
        mealType: updatedMeal.type,
        name: updatedMeal.name,
        time: new Date().toISOString(),
        carbs: updatedMeal.carbs,
        description: updatedMeal.description,
        calories: updatedMeal.calories,
        protein: updatedMeal.protein,
        fat: updatedMeal.fat,
        ingredients: updatedMeal.ingredients,
        preparation: updatedMeal.preparation,
        fiber: updatedMeal.fiber,
        sugar: updatedMeal.sugar,
        sodium: updatedMeal.sodium,
        isFromPlan: true,
      },
    });
    // await sendNotifications({
    //   subscription: updatedMeal.mealPlan?.user.subscription,
    //   payload: { title: "Consumed Meal as per Plan" },
    // });
    res.status(200).json({
      updatedMeals: updatedMeal.mealPlan?.meals,
      date: updatedMeal.mealPlan?.date,
      consumedMeal,
    });
  } catch (error) {
    res.status(400).json({ error: "Meal tracking failed", err: error });
  }
};

export const trackAdHocMeal = async (req: Request, res: Response) => {
  try {
    const { mealData } = req.body;
    console.log("mealdata is", mealData);
    console.log(typeof mealData);
    const { timeZone } = req.body;
    const zone = timeZone || req.user?.timeZone || "UTC";
    const usersLocalTIme = DateTime.now().setZone(zone).toISO();
    const imagePath = req.file?.path || undefined;
    console.log("1");
    const jsonMEalData = JSON.parse(mealData);
    const user = await prisma.user.findUnique({
      where: { userId: req.user?.userId },
      select: {
        userPreferences: true,
        bodyMetrics: { orderBy: { createdAt: "desc" }, take: 1 },
        MealPlan: {
          include: {
            meals: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              where: {
                type: jsonMEalData.mealType,
              },
            },
          },
        },
        subscription: true,
        DietAdvice: true,
      },
    });
    console.log("2");

    // Check for nutritional deviations
    const data = await generateWithAI({
      userId: req.user?.userId,
      taskType: "meal-deviation",
      mealData: jsonMEalData,
      updatedUser: user as any,
      imagePath: imagePath,
    });
    console.log("data", data);

    const consumedMeal = await prisma.consumedMeal.create({
      data: {
        userId: req.user?.userId,
        time: new Date().toISOString(),
        mealType: jsonMEalData.mealType,
        name: jsonMEalData.name,
        description: data.mealDetails.description,
        calories: data.mealDetails.calories,
        protein: data.mealDetails.protein,
        fat: data.mealDetails.fat,
        carbs: data.mealDetails.carbs,
        ingredients: data.mealDetails.ingredients,
        preparation: data.mealDetails.preparation,
        fiber: data.mealDetails.fiber,
        sugar: data.mealDetails.sugar,
        sodium: data.mealDetails.sodium,
        isFromPlan: false,
      },
    });

    console.log("3");
    let recoveryAction;
    if (data.isSignificant) {
      recoveryAction = await prisma.recoveryAction.create({
        data: {
          userId: req.user?.userId!,
          sourceType: "MEAL_DEVIATION",
          deviations: data.deviations,
          consumedMealId: consumedMeal.id,
          actions: data.recoveryActions as Prisma.JsonObject,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
      });

      const notification = await prisma.notification.create({
        data: {
          userId: req.user?.userId!,
          title: "Nutrition Alert",
          message: data.notificationMessage,
          type: "nutrition_alert",
          referenceId: consumedMeal.id,
          createdAt: new Date().toISOString(),
        },
      });
      // await sendNotifications({
      //   subscription: user?.subscription,
      //   payload: { title: notification.title, body: notification.message },
      // });
    }

    res
      .status(201)
      .json({ meal: consumedMeal, recoveryAction: recoveryAction });
  } catch (error: any) {
    res.status(400).json({ errorMessage: error.message, error: error });
  }
};

// export const skipPlannedMeal = async (req: Request, res: Response) => {
//   try {
//     const { mealId } = req.params;

//     const meal = await prisma.meal.update({
//       where: { id: mealId },
//       data: {
//         consumed: false,
//         consumedAt: null,
//       },
//     });
//     // Create recovery action
//     const recoveryAction = await prisma.recoveryAction.create({
//       data: {
//         userId,
//         sourceType: "MEAL_SKIPPED",
//         sourceId: mealId,
//         actions: {
//           mealDetails: await getMealNutritionDetails(mealId),
//           suggestions: await generateMealRecoverySuggestions(userId, mealId),
//         } as Prisma.JsonObject,
//         status: "PENDING",
//       },
//     });

//     // Create notification
//     await prisma.notification.create({
//       data: {
//         userId,
//         title: "Meal Skipped",
//         message: `Recovery suggestions for your skipped ${meal.type} meal.`,
//         type: "meal_skipped",
//         referenceId: recoveryAction.id,
//       },
//     });
//     res.json(meal);
//   } catch (error) {
//     res.status(400).json({ error: "Failed to update meal status" });
//   }
// };
// async function getMealNutritionDetails(mealId: string) {
//   const meal = await prisma.meal.findUnique({
//     where: { id: mealId },
//     select: {
//       name: true,
//       calories: true,
//       protein: true,
//       carbs: true,
//       fat: true,
//     },
//   });
//   return meal || null;
// }

// async function generateMealRecoverySuggestions(userId: string, mealId: string) {
//   // Implement logic to generate recovery suggestions
//   // Could use AI or predefined rules based on meal type and user preferences
//   return [
//     "Add extra protein to next meal",
//     "Include healthy fats in your next snack",
//   ];
// }
interface MealSummaryItem {
  id: string;
  type: string;
  isFromPlan: boolean;
  calories: number;
  consumedAt: Date;
}
interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: MealSummaryItem[];
}

export const getNutritionSummary = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    // Get all consumed meals for the day (both from plan and ad-hoc)
    const consumedMeals = await prisma.consumedMeal.findMany({
      where: {
        userId: req.user?.userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        meal: true, // Include the meal details if it was from a plan
      },
    });

    // Calculate nutrition summary
    const summary: NutritionSummary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: [],
    };

    consumedMeals.forEach((consumedMeal: any) => {
      if (consumedMeal.meal) {
        // Meal from plan
        summary.totalCalories += consumedMeal.meal.calories;
        summary.totalProtein += consumedMeal.meal.protein;
        summary.totalCarbs += consumedMeal.meal.carbs;
        summary.totalFat += consumedMeal.meal.fat;
      } else if (consumedMeal.details) {
        // Ad-hoc meal - assuming details contains nutrition info
        const details = consumedMeal.details as any;
        summary.totalCalories += details.calories || 0;
        summary.totalProtein += details.protein || 0;
        summary.totalCarbs += details.carbs || 0;
        summary.totalFat += details.fat || 0;
      }

      summary.meals.push({
        id: consumedMeal.id,
        type: consumedMeal.mealType,
        isFromPlan: consumedMeal.isFromPlan,
        calories:
          consumedMeal.meal?.calories ||
          (consumedMeal.details as any)?.calories ||
          0,
        consumedAt: consumedMeal.createdAt,
      });
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Summary generation failed" });
  }
};
