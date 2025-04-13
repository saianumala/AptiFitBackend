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
exports.getNutritionSummary = exports.trackAdHocMeal = exports.trackMealConsumption = exports.getCurrentPlan = exports.generateDailyPlan = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const personalisedAi_1 = require("../utils/personalisedAi");
// import { sendNotifications } from "../notifications/sendNotification";
const getLocalTime_1 = require("../utils/getLocalTime");
const luxon_1 = require("luxon");
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
const generateDailyPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // console.log("todays date", today);
        const { timeZone } = req.body;
        const localTime = (0, getLocalTime_1.getUserLocalDate)({
            timezone: timeZone,
            usersDefaultZone: (_a = req.user) === null || _a === void 0 ? void 0 : _a.timeZone,
        });
        // 1. Generate AI Plan BEFORE the transaction
        console.log(typeof localTime);
        console.log(localTime);
        console.log(new Date());
        const plan = yield (0, personalisedAi_1.generateWithAI)({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId,
            taskType: "meal-plan",
        });
        // 2. Start transaction
        const createdPlan = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            // Delete unconsumed meals
            const existingPlan = yield tx.mealPlan.findUnique({
                where: {
                    userId_date: {
                        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
                        date: localTime,
                    },
                },
                include: { meals: true },
            });
            if (existingPlan) {
                const unconsumedIds = existingPlan.meals
                    .filter((meal) => !meal.consumed)
                    .map((meal) => meal.id);
                if (unconsumedIds.length > 0) {
                    yield tx.meal.deleteMany({
                        where: { id: { in: unconsumedIds } },
                    });
                }
                const remaining = existingPlan.meals.filter((meal) => meal.consumed);
                console.log("remaining", remaining);
                return yield tx.mealPlan.update({
                    where: {
                        id: existingPlan === null || existingPlan === void 0 ? void 0 : existingPlan.id,
                    },
                    data: {
                        meals: {
                            create: plan.meals.map((meal) => ({
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
            return yield tx.mealPlan.create({
                data: {
                    userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId,
                    date: localTime,
                    meals: {
                        create: plan.meals.map((meal) => ({
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
        }));
        // 3. Notification logic after DB operations
        const user = yield prisma_1.default.user.findFirst({
            where: { userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId },
            select: {
                subscription: {
                    omit: {
                        userId: true,
                        id: true,
                    },
                },
            },
        });
        const notification = yield prisma_1.default.notification.create({
            data: {
                userId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId,
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
    }
    catch (error) {
        console.error("Plan generation failed:", error);
        res.status(500).json({ error: "Plan generation failed", err: error });
    }
});
exports.generateDailyPlan = generateDailyPlan;
const getCurrentPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { timeZone } = req.body;
        const localTime = (0, getLocalTime_1.getUserLocalDate)({
            timezone: timeZone,
            usersDefaultZone: (_a = req.user) === null || _a === void 0 ? void 0 : _a.timeZone,
        });
        const plan = yield prisma_1.default.mealPlan.findFirst({
            where: {
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId,
                date: localTime,
            },
            include: {
                meals: true,
            },
        });
        res.json(plan || null);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch plan" });
    }
});
exports.getCurrentPlan = getCurrentPlan;
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
const trackMealConsumption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log("reached track meal");
        console.log(req.body);
        const { mealId } = req.body;
        const { timeZone } = req.body;
        const zone = timeZone || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.timeZone) || "UTC";
        const usersLocalTIme = luxon_1.DateTime.now().setZone(zone).toISO();
        console.log(mealId);
        console.log(usersLocalTIme);
        // Update the meal in the meal plan to mark it as consumed
        const updatedMeal = yield prisma_1.default.meal.update({
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
        const consumedMeal = yield prisma_1.default.consumedMeal.create({
            data: {
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId,
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
            updatedMeals: (_c = updatedMeal.mealPlan) === null || _c === void 0 ? void 0 : _c.meals,
            date: (_d = updatedMeal.mealPlan) === null || _d === void 0 ? void 0 : _d.date,
            consumedMeal,
        });
    }
    catch (error) {
        res.status(400).json({ error: "Meal tracking failed", err: error });
    }
});
exports.trackMealConsumption = trackMealConsumption;
const trackAdHocMeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { mealData } = req.body;
        console.log("mealdata is", mealData);
        console.log(typeof mealData);
        const { timeZone } = req.body;
        const zone = timeZone || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.timeZone) || "UTC";
        const usersLocalTIme = luxon_1.DateTime.now().setZone(zone).toISO();
        const imagePath = ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) || undefined;
        console.log("1");
        const jsonMEalData = JSON.parse(mealData);
        const user = yield prisma_1.default.user.findUnique({
            where: { userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId },
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
        const data = yield (0, personalisedAi_1.generateWithAI)({
            userId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId,
            taskType: "meal-deviation",
            mealData: jsonMEalData,
            updatedUser: user,
            imagePath: imagePath,
        });
        console.log("data", data);
        const consumedMeal = yield prisma_1.default.consumedMeal.create({
            data: {
                userId: (_e = req.user) === null || _e === void 0 ? void 0 : _e.userId,
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
            recoveryAction = yield prisma_1.default.recoveryAction.create({
                data: {
                    userId: (_f = req.user) === null || _f === void 0 ? void 0 : _f.userId,
                    sourceType: "MEAL_DEVIATION",
                    deviations: data.deviations,
                    consumedMealId: consumedMeal.id,
                    actions: data.recoveryActions,
                    status: "PENDING",
                    createdAt: new Date().toISOString(),
                },
            });
            const notification = yield prisma_1.default.notification.create({
                data: {
                    userId: (_g = req.user) === null || _g === void 0 ? void 0 : _g.userId,
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
    }
    catch (error) {
        res.status(400).json({ errorMessage: error.message, error: error });
    }
});
exports.trackAdHocMeal = trackAdHocMeal;
const getNutritionSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { date } = req.query;
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        // Get all consumed meals for the day (both from plan and ad-hoc)
        const consumedMeals = yield prisma_1.default.consumedMeal.findMany({
            where: {
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
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
        const summary = {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            meals: [],
        };
        consumedMeals.forEach((consumedMeal) => {
            var _a, _b;
            if (consumedMeal.meal) {
                // Meal from plan
                summary.totalCalories += consumedMeal.meal.calories;
                summary.totalProtein += consumedMeal.meal.protein;
                summary.totalCarbs += consumedMeal.meal.carbs;
                summary.totalFat += consumedMeal.meal.fat;
            }
            else if (consumedMeal.details) {
                // Ad-hoc meal - assuming details contains nutrition info
                const details = consumedMeal.details;
                summary.totalCalories += details.calories || 0;
                summary.totalProtein += details.protein || 0;
                summary.totalCarbs += details.carbs || 0;
                summary.totalFat += details.fat || 0;
            }
            summary.meals.push({
                id: consumedMeal.id,
                type: consumedMeal.mealType,
                isFromPlan: consumedMeal.isFromPlan,
                calories: ((_a = consumedMeal.meal) === null || _a === void 0 ? void 0 : _a.calories) ||
                    ((_b = consumedMeal.details) === null || _b === void 0 ? void 0 : _b.calories) ||
                    0,
                consumedAt: consumedMeal.createdAt,
            });
        });
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ error: "Summary generation failed" });
    }
});
exports.getNutritionSummary = getNutritionSummary;
