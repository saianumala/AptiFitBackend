import { json, Request, Response } from "express";
import prisma from "../prisma";
import { z } from "zod";
import {
  calculateBodyMetrics,
  generateHydrationAdvice,
  generateMealPlan,
  generateMotivationAdvice,
  generateSleepAdvice,
  generateWorkoutAdvice,
  personalisedAi,
} from "../utils/personalisedAi";
import { getUserLocalDate } from "../utils/getLocalTime";

// Function to convert cm → feet
const cmToFeet = (cm: number) => cm / 30.48;

// Function to convert lbs → kg
const lbsToKg = (lbs: number) => lbs * 0.453592;

// Function to convert cm → inches
const cmToInches = (cm: number) => cm / 2.54;

// Define schema with preprocessing logic
export const preferencesSchema = z
  .object({
    gender: z.enum(["male", "female", "other", "prefer not to say"], {
      errorMap: () => ({
        message: "Gender must be 'male', 'female', or 'other'.",
      }),
    }),

    age: z
      .object({
        value: z
          .number({ invalid_type_error: "Age must be a number." })
          .min(10, "Age must be at least 10.")
          .max(100, "Age must be no more than 100."),
        unit: z.enum(["years"], {
          errorMap: () => ({ message: "Height unit must be 'cm' or 'ft'." }),
        }),
      })
      .transform(({ value }) => value),
    // Height conversion (store in feet)
    height: z
      .object({
        value: z
          .number({ invalid_type_error: "Height must be a number." })
          .positive("Height must be a positive number."),
        unit: z.enum(["cm", "ft"], {
          errorMap: () => ({ message: "Height unit must be 'cm' or 'ft'." }),
        }),
      })
      .transform(({ value, unit }) =>
        unit === "cm" ? cmToFeet(value) : value
      ),

    // Weight conversion (store in kg)
    weight: z
      .object({
        value: z
          .number({ invalid_type_error: "Weight must be a number." })
          .positive("Weight must be a positive number."),
        unit: z.enum(["lb", "kg"], {
          errorMap: () => ({ message: "Weight unit must be 'lb' or 'kg'." }),
        }),
      })
      .transform(({ value, unit }) => (unit === "lb" ? lbsToKg(value) : value)),

    activityLevel: z.enum(
      ["sedentary", "lightly_active", "active", "moderate", "very_active"],
      {
        errorMap: () => ({
          message:
            "Activity level must be one of: sedentary, lightly_active, active, moderate, very_active.",
        }),
      }
    ),

    preferredWorkoutType: z
      .enum(
        [
          "strength",
          "cardio",
          "endurance",
          "calisthenics",
          "hiit",
          "yoga",
          "pilates",
        ],
        {
          errorMap: () => ({
            message:
              "workout type should be strength, cardio, endurance, calisthenics, hiit, yoga, flexibility, or balance",
          }),
        }
      )
      .default("strength"),

    healthGoalFocus: z
      .string({ invalid_type_error: "Health goal focus must be a string." })
      .min(1, "Health goal focus is required."),

    dietaryRestrictions: z.string().optional().nullable(),

    // Waist Circumference conversion (store in inches)
    waistCircumference: z
      .preprocess(
        (input: any) => {
          if (
            typeof input === "object" &&
            input !== null &&
            "value" in input &&
            "unit" in input
          ) {
            return input;
          }
          return null;
        },
        z.object({
          value: z
            .number({
              invalid_type_error: "Waist circumference must be a number.",
            })
            .positive("Waist circumference must be a positive number."),
          unit: z.enum(["in", "cm"], {
            errorMap: () => ({
              message: "Waist circumference unit must be 'in' or 'cm'.",
            }),
          }),
        })
      )
      .optional()
      .nullable()
      .transform((waist) =>
        waist
          ? waist.unit === "cm"
            ? cmToInches(waist.value)
            : waist.value
          : undefined
      ),
    neckCircumference: z
      .preprocess(
        (input: any) => {
          if (
            typeof input === "object" &&
            input !== null &&
            "value" in input &&
            "unit" in input
          ) {
            return input;
          }
          return null;
        },
        z.object({
          value: z
            .number({
              invalid_type_error: "neck circumference must be a number.",
            })
            .positive("neck circumference must be a positive number."),
          unit: z.enum(["in", "cm"], {
            errorMap: () => ({
              message: "neck circumference unit must be 'in' or 'cm'.",
            }),
          }),
        })
      )
      .nullable()
      .transform((neck) =>
        neck
          ? neck.unit === "cm"
            ? cmToInches(neck.value)
            : neck.value
          : undefined
      )
      .optional(),
    hip: z
      .preprocess(
        (input: any) => {
          if (
            typeof input === "object" &&
            input !== null &&
            "value" in input &&
            "unit" in input
          ) {
            return input;
          }
          return null;
        },
        z.object({
          value: z
            .number({
              invalid_type_error: "hip circumference must be a number.",
            })
            .positive("hip circumference must be a positive number."),
          unit: z.enum(["in", "cm"], {
            errorMap: () => ({
              message: "hip circumference unit must be 'in' or 'cm'.",
            }),
          }),
        })
      )
      .optional()
      .nullable()
      .transform((hip) =>
        hip
          ? hip.unit === "cm"
            ? cmToInches(hip.value)
            : hip.value
          : undefined
      ),

    waterIntake: z
      .number()
      .min(0.1, "Water intake must be at least 0.1 liters.")
      .max(10, "Water intake cannot exceed 10 liters.")
      .optional()
      .nullable(),

    // Optional A.nullable()PI/Device Data
    stepsDaily: z
      .number()
      .int("Steps count must be a whole number.")
      .positive("Steps count must be a positive number.")
      .max(100000, "Steps count cannot exceed 100,000.")
      .optional()
      .nullable(),

    heartRate: z
      .number()
      .int("Heart rate must be a whole number.")
      .positive("Heart rate must be a positive number.")
      .max(220, "Heart rate cannot exceed 220 bpm.")
      .optional()
      .nullable(),

    caloriesBurned: z
      .number()
      .positive("Calories burned must be a positive number.")
      .max(10000, "Calories burned cannot exceed 10,000.")
      .optional()
      .nullable(),

    sleepDuration: z
      .number()
      .positive("Sleep duration must be a positive number.")
      .max(24, "Sleep duration cannot exceed 24 hours.")
      .optional()
      .nullable(),

    // AI Coaching Preferences
    coachingIntensity: z
      .enum(["gentle", "balanced", "intense"], {
        errorMap: () => ({
          message:
            "Coaching intensity must be 'GENTLE', 'BALANCED', or 'INTENSE'.",
        }),
      })
      .default("balanced"),

    motivationStyle: z
      .enum(["supportive", "challenging", "data_driven"], {
        errorMap: () => ({
          message:
            "Motivation style must be 'SUPPORTIVE', 'CHALLENGING', or 'DATA_DRIVEN'.",
        }),
      })
      .default("supportive"),
    cuisine: z.string().optional().nullable(),

    // Notification Preferences
    notificationFrequency: z
      .object({
        value: z.number().min(1, "Value must be at least 1"),
        unit: z.enum(["min", "hour"], {
          errorMap: () => ({
            message: "Unit must be either 'min' or 'hour'.",
          }),
        }),
      })
      .default({ value: 30, unit: "min" }),
  })
  .transform((data) => ({
    ...data,
    // Ensure transformed values are rounded to two decimals
    height: parseFloat(data.height.toFixed(2)),
    weight: parseFloat(data.weight.toFixed(2)),
    waistCircumference: data.waistCircumference
      ? parseFloat(data.waistCircumference.toFixed(2))
      : undefined,
    notificationFrequency:
      data.notificationFrequency.unit === "hour"
        ? data.notificationFrequency.value * 60
        : data.notificationFrequency.value,
  }));

export const updatePreferencesSchema = preferencesSchema._def.schema
  .partial()
  .transform((data) => {
    const result: any = { ...data };

    if (data.height !== undefined) {
      result.height = parseFloat(data.height.toFixed(2));
    }
    if (data.weight !== undefined) {
      result.weight = parseFloat(data.weight.toFixed(2));
    }
    if (data.waistCircumference !== undefined) {
      result.waistCircumference = parseFloat(
        data.waistCircumference.toFixed(2)
      );
    }
    if (data.notificationFrequency !== undefined) {
      result.notificationFrequency =
        data.notificationFrequency.unit === "hour"
          ? data.notificationFrequency.value * 60
          : data.notificationFrequency.value;
    }

    return result;
  });

export async function createPreferences(req: Request, res: Response) {
  try {
    const validationResult = preferencesSchema.safeParse(
      req.body.userPreferences
    );
    const { timeZone } = req.body;
    const localTime = getUserLocalDate({
      timezone: timeZone,
      usersDefaultZone: req.user?.timeZone,
    });
    console.log(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        issue: issue,
      }));
      res.status(400).json({ errors });
      return;
    }

    const userId = req.user?.userId;
    const validatedData = validationResult.data;
    console.log(validatedData);
    // Create preferences and calculate metrics in a transaction
    const [createdPreferences, bodyMetrics] = await prisma.$transaction([
      prisma.userPreferences.create({
        data: {
          userId,
          ...validatedData,
        },
        omit: {},
      }),
      prisma.bodyMetric.create({
        data: {
          userId,
          ...calculateBodyMetrics({
            gender: validatedData.gender,
            age: validatedData.age,
            height: validatedData.height,
            weight: validatedData.weight,
            neckCircumference: validatedData.neckCircumference,
            hip: validatedData.hip || null,
            activityLevel: validatedData.activityLevel,
            waistCircumference: validatedData.waistCircumference,
          }).bodyMetrics,
        },
      }),
    ]);

    // Generate all AI recommendations in parallel
    const aiResponse = await personalisedAi({
      updatedUser: {
        userPreferences: createdPreferences,
        bodyMetrics,
      },
      timeZone: req.user?.timeZone,
      category: "all",
    });
    console.log("AI Response: ", aiResponse);
    if (!aiResponse.error) {
      const { diet, workout, meals, hydration, sleep, motivation } = aiResponse;
      for (const key in aiResponse) {
        console.log(`${key}:`, aiResponse[key]);
      }

      await Promise.all([
        // Create diet advice and meal plan
        prisma.dietAdvice.create({
          data: {
            userId,
            summary: diet.summary,
            calories: diet.calories,
            macronutrients: diet.macronutrients,
            recommendations: diet.recommendations,
          },
        }),
        prisma.mealPlan.create({
          data: {
            userId,
            date: localTime,
            meals: {
              create: meals.map((meal: any) => ({
                name: meal.name,
                time: meal.time,
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
              })),
            },
          },
        }),
        // Create workout advice
        prisma.workoutAdvice.create({
          data: {
            userId,
            summary: workout.summary,
            frequency: workout.frequency,
            type: workout.type,
            workouts: {
              create:
                workout.workouts?.map((w: any, index: number) => {
                  console.log(`Workout ${index} exercises:`, w.exercises);

                  return {
                    date: localTime,
                    time: w.time,
                    type: w.type,
                    targetMuscles: w.targetMuscles,
                    duration: w.duration,
                    order: w.order,
                    Exercise: {
                      create: w.exercises.map((exercise: any) => ({
                        name: exercise.name,
                        type: exercise.type,
                        sets: exercise.sets.toString(),
                        reps: exercise.reps.toString(),
                        restTime: exercise.restTime.toString(),
                      })),
                    },
                  };
                }) || [],
            },
          },
        }),
        // Create hydration advice
        prisma.hydrationAdvice.create({
          data: {
            userId,
            summary: hydration.summary,
            current: hydration.current,
            target: hydration.target,
            progress: hydration.progress,
            adjustment: hydration.adjustment,
            recommendations: hydration.recommendations,
          },
        }),
        // Create sleep advice
        prisma.sleepAdvice.create({
          data: {
            userId,
            summary: sleep.summary,
            current: sleep.current,
            target: sleep.target,
            improvement: sleep.improvement,
            recovery: sleep.recovery,
          },
        }),
        // Create motivation advice
        prisma.motivationAdvice.create({
          data: {
            userId,
            summary: motivation.summary,
            strategies: motivation.strategies,
            boosters: motivation.boosters,
            recovery: motivation.recovery,
          },
        }),
      ]);
    }

    // Update user's first login status
    await prisma.user.update({
      where: { userId },
      data: { firstLogin: false },
    });

    res.status(201).json({
      message: "Preferences created successfully",
      preferences: createdPreferences,
      bodyMetrics,
    });
    return;
  } catch (error) {
    console.error("Error creating preferences:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

export async function updatePreferences(req: Request, res: Response) {
  try {
    const validationResult = updatePreferencesSchema.safeParse(
      req.body.userPreferences
    );
    console.log(req.body.userPreferences);
    if (!validationResult.success) {
      res.status(400).json({
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }
    const { timeZone } = req.body;
    const localTime = getUserLocalDate({
      timezone: timeZone,
      usersDefaultZone: req.user?.timeZone,
    });

    const userId = req.user?.userId;
    const validatedData = validationResult.data;
    console.log("validatedData: ", validatedData);

    // Get current preferences to detect changes
    const currentPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!currentPreferences) {
      res.status(404).json({ error: "User preferences not found" });
      return;
    }

    // Update preferences
    const updatedPreferences = await prisma.userPreferences.update({
      where: { userId },
      data: validatedData,
    });

    // Check which fields changed
    const changedFields = Object.keys(validatedData).filter(
      (key) =>
        JSON.stringify(validatedData[key as keyof typeof validatedData]) !==
        JSON.stringify(
          currentPreferences[key as keyof typeof currentPreferences]
        )
    );

    // Recalculate body metrics if relevant fields changed
    let updatedBodyMetrics;
    if (
      changedFields.some((f) =>
        [
          "weight",
          "height",
          "activityLevel",
          "waistCircumference",
          "neckCircumference",
          "hip",
        ].includes(f)
      )
    ) {
      updatedBodyMetrics = await prisma.bodyMetric.create({
        data: {
          userId,
          ...calculateBodyMetrics({
            gender: updatedPreferences.gender,
            age: updatedPreferences.age,
            height: updatedPreferences.height,
            weight: updatedPreferences.weight,
            neckCircumference: updatedPreferences.neckCircumference,
            hip: updatedPreferences.hip,
            activityLevel: updatedPreferences.activityLevel,
            waistCircumference: updatedPreferences.waistCircumference,
          }).bodyMetrics,
        },
      });
    }

    // Regenerate advice based on changed fields
    const adviceUpdates = [];

    if (
      changedFields.some((f) =>
        [
          "dietaryRestrictions",
          "healthGoalFocus",
          "weight",
          "cuisine",
        ].includes(f)
      )
    ) {
      adviceUpdates.push(
        generateMealPlan({
          userPreferences: updatedPreferences,
          bodyMetrics: updatedBodyMetrics!,
        }).then(async (mealPlan) => {
          // Check for today's meal plan
          let todayPlan = await prisma.mealPlan.findUnique({
            where: {
              userId_date: {
                userId: req.user?.userId,
                date: localTime,
              },
            },
            include: { meals: true },
          });
          console.log(todayPlan);
          const allMealTypes = ["breakfast", "lunch", "snack", "dinner"];
          let consumedTypes: string[] = [];

          if (todayPlan) {
            // Find which meals were already consumed (via ConsumedMeal)
            const consumedMeals = await prisma.consumedMeal.findMany({
              where: {
                userId,
                isFromPlan: true,
                createdAt: {
                  gte: localTime,
                },
              },
              select: {
                mealType: true,
              },
            });

            consumedTypes = consumedMeals.map((m) => m.mealType);

            // Remove unconsumed meals from the existing plan
            await prisma.meal.deleteMany({
              where: {
                mealPlanId: todayPlan.id,
                type: {
                  in: allMealTypes.filter(
                    (type) => !consumedTypes.includes(type)
                  ),
                },
              },
            });

            // Generate only missing meals
            const mealsToGenerate = allMealTypes.filter(
              (type) => !consumedTypes.includes(type)
            );

            const newMeals = mealPlan.meals.filter((meal: any) =>
              mealsToGenerate.includes(meal.type)
            );

            // Add new meals to existing plan
            await prisma.mealPlan.update({
              where: { id: todayPlan.id },
              data: {
                meals: {
                  create: newMeals.map((meal: any) => ({
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
                  })),
                },
              },
            });
          } else {
            // No plan exists – create fresh
            await prisma.mealPlan.create({
              data: {
                userId,
                date: localTime,
                meals: {
                  create: mealPlan.meals.map((meal: any) => ({
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
                  })),
                },
              },
            });
          }
        })
      );
    }
    // if( changedFields.some((f) =>
    //   ["waterIntake"].includes(
    //     f
    //   )
    // )){

    // }
    if (
      changedFields.some((f) =>
        ["activityLevel", "preferredWorkoutType", "coachingIntensity"].includes(
          f
        )
      )
    ) {
      adviceUpdates.push(
        generateWorkoutAdvice({
          userPreferences: updatedPreferences,
          bodyMetrics: updatedBodyMetrics!,
        }).then((workoutAdvicee) =>
          prisma.workoutAdvice.create({
            data: {
              userId,
              summary: workoutAdvicee.summary,
              frequency: workoutAdvicee.frequency,
              type: workoutAdvicee.type,
              workouts: {
                create:
                  workoutAdvicee.workouts?.map((w: any) => ({
                    date: localTime,
                    time: w.time,
                    name: w.name,
                    description: w.description,
                    type: w.type,
                    targetMuscles: w.targetMuscles,
                    duration: w.duration,
                    order: w.order,
                    Exercise: {
                      create: w.exercises.map((exercise: any) => ({
                        name: exercise.name,
                        type: exercise.type,
                        sets: exercise.sets.toString(),
                        reps: exercise.reps.toString(),
                        restTime: exercise.restTime.toString(),
                      })),
                    },
                  })) || [],
              },
            },
          })
        )
      );
    }

    await Promise.all(adviceUpdates);

    res.status(200).json({
      message: "Preferences updated successfully",
      preferences: updatedPreferences,
      bodyMetrics: updatedBodyMetrics,
    });
    return;
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

export async function deletePreferences(req: Request, res: Response) {
  try {
    await prisma.userPreferences.delete({
      where: { userId: req.user?.userId },
    });

    res.status(204).end();
    return;
  } catch (error) {
    console.error("Error deleting preferences:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

export async function getPreferences(req: Request, res: Response) {
  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user?.userId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!preferences) {
      res.status(404).json({ error: "Preferences not found" });
      return;
    }

    res.status(200).json(preferences);
    return;
  } catch (error) {
    console.error("Error getting preferences:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

// export const getRecommendationSettings = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const preferences = await prisma.userPreferences.findUnique({
//       where: { userId: req.user.id },
//       select: {
//         recommendationIntensity: true,
//         preferredRecoveryMethods: true,
//         adaptivePlanningEnabled: true,
//       },
//     });
//     res.json(preferences || {});
//   } catch (error) {
//     res.status(500).json({ error: "Failed to get recommendation settings" });
//   }
// };

// export const updateRecommendationSettings = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const {
//       recommendationIntensity,
//       preferredRecoveryMethods,
//       adaptivePlanningEnabled,
//     } = req.body;

//     const updated = await prisma.userPreferences.upsert({
//       where: { userId: req.user?.userId },
//       update: {
//         recommendationIntensity,
//         preferredRecoveryMethods,
//         adaptivePlanningEnabled,
//       },
//       create: {
//         userId: req.user.id,
//         recommendationIntensity,
//         preferredRecoveryMethods,
//         adaptivePlanningEnabled,
//       },
//     });

//     res.json(updated);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update recommendation settings" });
//   }
// };
