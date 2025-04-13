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
exports.generateUserContext = void 0;
const luxon_1 = require("luxon");
const prisma_1 = __importDefault(require("../prisma"));
function generateUserContext(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userData, }) {
        // Query DB for latest meals, workouts, goals, etc.
        const todayStart = luxon_1.DateTime.now().setZone(userData.timeZone).startOf("day").toISO() ||
            new Date(new Date().setHours(0, 0, 0, 0));
        const userId = userData.userId;
        // const todayStart = new Date();
        // todayStart.setHours(0, 0, 0, 0);
        const user = yield prisma_1.default.user.findUnique({
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
      ${JSON.stringify(user === null || user === void 0 ? void 0 : user.userPreferences)}
      Body Metrics:
      ${JSON.stringify(user === null || user === void 0 ? void 0 : user.bodyMetrics)}
      Meal Plan:
      ${JSON.stringify(user === null || user === void 0 ? void 0 : user.MealPlan)}
      Consumed Meals:
      ${JSON.stringify(user === null || user === void 0 ? void 0 : user.ConsumedMeals)}
      Workout Advice:
      ${JSON.stringify(user === null || user === void 0 ? void 0 : user.WorkoutAdvice)}
      Recovery Actions:
      ${JSON.stringify(user === null || user === void 0 ? void 0 : user.RecoveryActions)}
Current Time: ${luxon_1.DateTime.now().setZone(userData.timeZone)}

    `;
    });
}
exports.generateUserContext = generateUserContext;
