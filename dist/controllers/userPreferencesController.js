"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreferences = exports.deletePreferences = exports.updatePreferences = exports.createPreferences = exports.updatePreferencesSchema = exports.preferencesSchema = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const personalisedAi_1 = require("../utils/personalisedAi");
const getLocalTime_1 = require("../utils/getLocalTime");
// Function to convert cm → feet
const cmToFeet = (cm) => cm / 30.48;
// Function to convert lbs → kg
const lbsToKg = (lbs) => lbs * 0.453592;
// Function to convert cm → inches
const cmToInches = (cm) => cm / 2.54;
// Define schema with preprocessing logic
exports.preferencesSchema = zod_1.z
    .object({
    gender: zod_1.z.enum(["male", "female", "other", "prefer not to say"], {
        errorMap: () => ({
            message: "Gender must be 'male', 'female', or 'other'.",
        }),
    }),
    age: zod_1.z
        .object({
        value: zod_1.z
            .number({ invalid_type_error: "Age must be a number." })
            .min(10, "Age must be at least 10.")
            .max(100, "Age must be no more than 100."),
        unit: zod_1.z.enum(["years"], {
            errorMap: () => ({ message: "Height unit must be 'cm' or 'ft'." }),
        }),
    })
        .transform(({ value }) => value),
    // Height conversion (store in feet)
    height: zod_1.z
        .object({
        value: zod_1.z
            .number({ invalid_type_error: "Height must be a number." })
            .positive("Height must be a positive number."),
        unit: zod_1.z.enum(["cm", "ft"], {
            errorMap: () => ({ message: "Height unit must be 'cm' or 'ft'." }),
        }),
    })
        .transform(({ value, unit }) => unit === "cm" ? cmToFeet(value) : value),
    // Weight conversion (store in kg)
    weight: zod_1.z
        .object({
        value: zod_1.z
            .number({ invalid_type_error: "Weight must be a number." })
            .positive("Weight must be a positive number."),
        unit: zod_1.z.enum(["lb", "kg"], {
            errorMap: () => ({ message: "Weight unit must be 'lb' or 'kg'." }),
        }),
    })
        .transform(({ value, unit }) => (unit === "lb" ? lbsToKg(value) : value)),
    activityLevel: zod_1.z.enum(["sedentary", "lightly_active", "active", "moderate", "very_active"], {
        errorMap: () => ({
            message: "Activity level must be one of: sedentary, lightly_active, active, moderate, very_active.",
        }),
    }),
    preferredWorkoutType: zod_1.z
        .enum([
        "strength",
        "cardio",
        "endurance",
        "calisthenics",
        "hiit",
        "yoga",
        "pilates",
    ], {
        errorMap: () => ({
            message: "workout type should be strength, cardio, endurance, calisthenics, hiit, yoga, flexibility, or balance",
        }),
    })
        .default("strength"),
    healthGoalFocus: zod_1.z
        .string({ invalid_type_error: "Health goal focus must be a string." })
        .min(1, "Health goal focus is required."),
    dietaryRestrictions: zod_1.z.string().optional().nullable(),
    // Waist Circumference conversion (store in inches)
    waistCircumference: zod_1.z
        .preprocess((input) => {
        if (typeof input === "object" &&
            input !== null &&
            "value" in input &&
            "unit" in input) {
            return input;
        }
        return null;
    }, zod_1.z.object({
        value: zod_1.z
            .number({
            invalid_type_error: "Waist circumference must be a number.",
        })
            .positive("Waist circumference must be a positive number."),
        unit: zod_1.z.enum(["in", "cm"], {
            errorMap: () => ({
                message: "Waist circumference unit must be 'in' or 'cm'.",
            }),
        }),
    }))
        .optional()
        .nullable()
        .transform((waist) => waist
        ? waist.unit === "cm"
            ? cmToInches(waist.value)
            : waist.value
        : undefined),
    neckCircumference: zod_1.z
        .preprocess((input) => {
        if (typeof input === "object" &&
            input !== null &&
            "value" in input &&
            "unit" in input) {
            return input;
        }
        return null;
    }, zod_1.z.object({
        value: zod_1.z
            .number({
            invalid_type_error: "neck circumference must be a number.",
        })
            .positive("neck circumference must be a positive number."),
        unit: zod_1.z.enum(["in", "cm"], {
            errorMap: () => ({
                message: "neck circumference unit must be 'in' or 'cm'.",
            }),
        }),
    }))
        .nullable()
        .transform((neck) => neck
        ? neck.unit === "cm"
            ? cmToInches(neck.value)
            : neck.value
        : undefined)
        .optional(),
    hip: zod_1.z
        .preprocess((input) => {
        if (typeof input === "object" &&
            input !== null &&
            "value" in input &&
            "unit" in input) {
            return input;
        }
        return null;
    }, zod_1.z.object({
        value: zod_1.z
            .number({
            invalid_type_error: "hip circumference must be a number.",
        })
            .positive("hip circumference must be a positive number."),
        unit: zod_1.z.enum(["in", "cm"], {
            errorMap: () => ({
                message: "hip circumference unit must be 'in' or 'cm'.",
            }),
        }),
    }))
        .optional()
        .nullable()
        .transform((hip) => hip
        ? hip.unit === "cm"
            ? cmToInches(hip.value)
            : hip.value
        : undefined),
    waterIntake: zod_1.z
        .number()
        .min(0.1, "Water intake must be at least 0.1 liters.")
        .max(10, "Water intake cannot exceed 10 liters.")
        .optional()
        .nullable(),
    // Optional A.nullable()PI/Device Data
    stepsDaily: zod_1.z
        .number()
        .int("Steps count must be a whole number.")
        .positive("Steps count must be a positive number.")
        .max(100000, "Steps count cannot exceed 100,000.")
        .optional()
        .nullable(),
    heartRate: zod_1.z
        .number()
        .int("Heart rate must be a whole number.")
        .positive("Heart rate must be a positive number.")
        .max(220, "Heart rate cannot exceed 220 bpm.")
        .optional()
        .nullable(),
    caloriesBurned: zod_1.z
        .number()
        .positive("Calories burned must be a positive number.")
        .max(10000, "Calories burned cannot exceed 10,000.")
        .optional()
        .nullable(),
    sleepDuration: zod_1.z
        .number()
        .positive("Sleep duration must be a positive number.")
        .max(24, "Sleep duration cannot exceed 24 hours.")
        .optional()
        .nullable(),
    // AI Coaching Preferences
    coachingIntensity: zod_1.z
        .enum(["gentle", "balanced", "intense"], {
        errorMap: () => ({
            message: "Coaching intensity must be 'GENTLE', 'BALANCED', or 'INTENSE'.",
        }),
    })
        .default("balanced"),
    motivationStyle: zod_1.z
        .enum(["supportive", "challenging", "data_driven"], {
        errorMap: () => ({
            message: "Motivation style must be 'SUPPORTIVE', 'CHALLENGING', or 'DATA_DRIVEN'.",
        }),
    })
        .default("supportive"),
    cuisine: zod_1.z.string().optional().nullable(),
    // Notification Preferences
    notificationFrequency: zod_1.z
        .object({
        value: zod_1.z.number().min(1, "Value must be at least 1"),
        unit: zod_1.z.enum(["min", "hour"], {
            errorMap: () => ({
                message: "Unit must be either 'min' or 'hour'.",
            }),
        }),
    })
        .default({ value: 30, unit: "min" }),
})
    .transform((data) => (Object.assign(Object.assign({}, data), { 
    // Ensure transformed values are rounded to two decimals
    height: parseFloat(data.height.toFixed(2)), weight: parseFloat(data.weight.toFixed(2)), waistCircumference: data.waistCircumference
        ? parseFloat(data.waistCircumference.toFixed(2))
        : undefined, notificationFrequency: data.notificationFrequency.unit === "hour"
        ? data.notificationFrequency.value * 60
        : data.notificationFrequency.value })));
exports.updatePreferencesSchema = exports.preferencesSchema._def.schema
    .partial()
    .transform((data) => {
    const result = Object.assign({}, data);
    if (data.height !== undefined) {
        result.height = parseFloat(data.height.toFixed(2));
    }
    if (data.weight !== undefined) {
        result.weight = parseFloat(data.weight.toFixed(2));
    }
    if (data.waistCircumference !== undefined) {
        result.waistCircumference = parseFloat(data.waistCircumference.toFixed(2));
    }
    if (data.notificationFrequency !== undefined) {
        result.notificationFrequency =
            data.notificationFrequency.unit === "hour"
                ? data.notificationFrequency.value * 60
                : data.notificationFrequency.value;
    }
    return result;
});
function createPreferences(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const validationResult = exports.preferencesSchema.safeParse(req.body.userPreferences);
            const { timeZone } = req.body;
            const localTime = (0, getLocalTime_1.getUserLocalDate)({
                timezone: timeZone,
                usersDefaultZone: (_a = req.user) === null || _a === void 0 ? void 0 : _a.timeZone,
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
            const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
            const validatedData = validationResult.data;
            console.log(validatedData);
            // Create preferences and calculate metrics in a transaction
            const [createdPreferences, bodyMetrics] = yield prisma_1.default.$transaction([
                prisma_1.default.userPreferences.create({
                    data: Object.assign({ userId }, validatedData),
                    omit: {},
                }),
                prisma_1.default.bodyMetric.create({
                    data: Object.assign({ userId }, (0, personalisedAi_1.calculateBodyMetrics)({
                        gender: validatedData.gender,
                        age: validatedData.age,
                        height: validatedData.height,
                        weight: validatedData.weight,
                        neckCircumference: validatedData.neckCircumference,
                        hip: validatedData.hip || null,
                        activityLevel: validatedData.activityLevel,
                        waistCircumference: validatedData.waistCircumference,
                    }).bodyMetrics),
                }),
            ]);
            // Generate all AI recommendations in parallel
            const aiResponse = yield (0, personalisedAi_1.personalisedAi)({
                updatedUser: {
                    userPreferences: createdPreferences,
                    bodyMetrics,
                },
                timeZone: (_c = req.user) === null || _c === void 0 ? void 0 : _c.timeZone,
                category: "all",
            });
            console.log("AI Response: ", aiResponse);
            if (!aiResponse.error) {
                const { diet, workout, meals, hydration, sleep, motivation } = aiResponse;
                for (const key in aiResponse) {
                    console.log(`${key}:`, aiResponse[key]);
                }
                yield Promise.all([
                    // Create diet advice and meal plan
                    prisma_1.default.dietAdvice.create({
                        data: {
                            userId,
                            summary: diet.summary,
                            calories: diet.calories,
                            macronutrients: diet.macronutrients,
                            recommendations: diet.recommendations,
                        },
                    }),
                    prisma_1.default.mealPlan.create({
                        data: {
                            userId,
                            date: localTime,
                            meals: {
                                create: meals.map((meal) => ({
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
                    prisma_1.default.workoutAdvice.create({
                        data: {
                            userId,
                            summary: workout.summary,
                            frequency: workout.frequency,
                            type: workout.type,
                            workouts: {
                                create: ((_d = workout.workouts) === null || _d === void 0 ? void 0 : _d.map((w, index) => {
                                    console.log(`Workout ${index} exercises:`, w.exercises);
                                    return {
                                        date: localTime,
                                        time: w.time,
                                        type: w.type,
                                        targetMuscles: w.targetMuscles,
                                        duration: w.duration,
                                        order: w.order,
                                        Exercise: {
                                            create: w.exercises.map((exercise) => ({
                                                name: exercise.name,
                                                type: exercise.type,
                                                sets: exercise.sets.toString(),
                                                reps: exercise.reps.toString(),
                                                restTime: exercise.restTime.toString(),
                                            })),
                                        },
                                    };
                                })) || [],
                            },
                        },
                    }),
                    // Create hydration advice
                    prisma_1.default.hydrationAdvice.create({
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
                    prisma_1.default.sleepAdvice.create({
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
                    prisma_1.default.motivationAdvice.create({
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
            yield prisma_1.default.user.update({
                where: { userId },
                data: { firstLogin: false },
            });
            res.status(201).json({
                message: "Preferences created successfully",
                preferences: createdPreferences,
                bodyMetrics,
            });
            return;
        }
        catch (error) {
            console.error("Error creating preferences:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
    });
}
exports.createPreferences = createPreferences;
function updatePreferences(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const validationResult = exports.updatePreferencesSchema.safeParse(req.body.userPreferences);
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
            const localTime = (0, getLocalTime_1.getUserLocalDate)({
                timezone: timeZone,
                usersDefaultZone: (_a = req.user) === null || _a === void 0 ? void 0 : _a.timeZone,
            });
            const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
            const validatedData = validationResult.data;
            console.log("validatedData: ", validatedData);
            // Get current preferences to detect changes
            const currentPreferences = yield prisma_1.default.userPreferences.findUnique({
                where: { userId },
            });
            if (!currentPreferences) {
                res.status(404).json({ error: "User preferences not found" });
                return;
            }
            // Update preferences
            const updatedPreferences = yield prisma_1.default.userPreferences.update({
                where: { userId },
                data: validatedData,
            });
            // Check which fields changed
            const changedFields = Object.keys(validatedData).filter((key) => JSON.stringify(validatedData[key]) !==
                JSON.stringify(currentPreferences[key]));
            // Recalculate body metrics if relevant fields changed
            let updatedBodyMetrics;
            if (changedFields.some((f) => [
                "weight",
                "height",
                "activityLevel",
                "waistCircumference",
                "neckCircumference",
                "hip",
            ].includes(f))) {
                updatedBodyMetrics = yield prisma_1.default.bodyMetric.create({
                    data: Object.assign({ userId }, (0, personalisedAi_1.calculateBodyMetrics)({
                        gender: updatedPreferences.gender,
                        age: updatedPreferences.age,
                        height: updatedPreferences.height,
                        weight: updatedPreferences.weight,
                        neckCircumference: updatedPreferences.neckCircumference,
                        hip: updatedPreferences.hip,
                        activityLevel: updatedPreferences.activityLevel,
                        waistCircumference: updatedPreferences.waistCircumference,
                    }).bodyMetrics),
                });
            }
            // Regenerate advice based on changed fields
            const adviceUpdates = [];
            if (changedFields.some((f) => [
                "dietaryRestrictions",
                "healthGoalFocus",
                "weight",
                "cuisine",
            ].includes(f))) {
                adviceUpdates.push((0, personalisedAi_1.generateMealPlan)({
                    userPreferences: updatedPreferences,
                    bodyMetrics: updatedBodyMetrics,
                }).then((mealPlan) => __awaiter(this, void 0, void 0, function* () {
                    var _c;
                    // Check for today's meal plan
                    let todayPlan = yield prisma_1.default.mealPlan.findUnique({
                        where: {
                            userId_date: {
                                userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId,
                                date: localTime,
                            },
                        },
                        include: { meals: true },
                    });
                    console.log(todayPlan);
                    const allMealTypes = ["breakfast", "lunch", "snack", "dinner"];
                    let consumedTypes = [];
                    if (todayPlan) {
                        // Find which meals were already consumed (via ConsumedMeal)
                        const consumedMeals = yield prisma_1.default.consumedMeal.findMany({
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
                        yield prisma_1.default.meal.deleteMany({
                            where: {
                                mealPlanId: todayPlan.id,
                                type: {
                                    in: allMealTypes.filter((type) => !consumedTypes.includes(type)),
                                },
                            },
                        });
                        // Generate only missing meals
                        const mealsToGenerate = allMealTypes.filter((type) => !consumedTypes.includes(type));
                        const newMeals = mealPlan.meals.filter((meal) => mealsToGenerate.includes(meal.type));
                        // Add new meals to existing plan
                        yield prisma_1.default.mealPlan.update({
                            where: { id: todayPlan.id },
                            data: {
                                meals: {
                                    create: newMeals.map((meal) => ({
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
                    else {
                        // No plan exists – create fresh
                        yield prisma_1.default.mealPlan.create({
                            data: {
                                userId,
                                date: localTime,
                                meals: {
                                    create: mealPlan.meals.map((meal) => ({
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
                })));
            }
            // if( changedFields.some((f) =>
            //   ["waterIntake"].includes(
            //     f
            //   )
            // )){
            // }
            if (changedFields.some((f) => ["activityLevel", "preferredWorkoutType", "coachingIntensity"].includes(f))) {
                adviceUpdates.push((0, personalisedAi_1.generateWorkoutAdvice)({
                    userPreferences: updatedPreferences,
                    bodyMetrics: updatedBodyMetrics,
                }).then((workoutAdvicee) => {
                    var _a;
                    return prisma_1.default.workoutAdvice.create({
                        data: {
                            userId,
                            summary: workoutAdvicee.summary,
                            frequency: workoutAdvicee.frequency,
                            type: workoutAdvicee.type,
                            workouts: {
                                create: ((_a = workoutAdvicee.workouts) === null || _a === void 0 ? void 0 : _a.map((w) => ({
                                    date: localTime,
                                    time: w.time,
                                    name: w.name,
                                    description: w.description,
                                    type: w.type,
                                    targetMuscles: w.targetMuscles,
                                    duration: w.duration,
                                    order: w.order,
                                    Exercise: {
                                        create: w.exercises.map((exercise) => ({
                                            name: exercise.name,
                                            type: exercise.type,
                                            sets: exercise.sets.toString(),
                                            reps: exercise.reps.toString(),
                                            restTime: exercise.restTime.toString(),
                                        })),
                                    },
                                }))) || [],
                            },
                        },
                    });
                }));
            }
            yield Promise.all(adviceUpdates);
            res.status(200).json({
                message: "Preferences updated successfully",
                preferences: updatedPreferences,
                bodyMetrics: updatedBodyMetrics,
            });
            return;
        }
        catch (error) {
            console.error("Error updating preferences:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
    });
}
exports.updatePreferences = updatePreferences;
function deletePreferences(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            yield prisma_1.default.userPreferences.delete({
                where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId },
            });
            res.status(204).end();
            return;
        }
        catch (error) {
            console.error("Error deleting preferences:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
    });
}
exports.deletePreferences = deletePreferences;
function getPreferences(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const preferences = yield prisma_1.default.userPreferences.findUnique({
                where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId },
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
        }
        catch (error) {
            console.error("Error getting preferences:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
    });
}
exports.getPreferences = getPreferences;
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
