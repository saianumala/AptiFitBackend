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
exports.sendFixedTimeNotifications = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const sendNotification_1 = require("./sendNotification");
function sendFixedTimeNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
        const today = new Date(now.toDateString());
        // Fetch Meals scheduled for now
        const meals = yield prisma_1.default.meal.findMany({
            where: {
                time: currentTime,
                mealPlan: { date: today },
            },
            include: {
                mealPlan: {
                    include: { user: { include: { subscription: true } } },
                },
            },
        });
        for (const meal of meals) {
            const user = (_a = meal === null || meal === void 0 ? void 0 : meal.mealPlan) === null || _a === void 0 ? void 0 : _a.user;
            if (user === null || user === void 0 ? void 0 : user.subscription) {
                yield (0, sendNotification_1.sendNotifications)({
                    subscription: user.subscription,
                    payload: {
                        title: `${meal.type} Time!`,
                        body: `It's time for your ${meal.name}. Enjoy your meal!`,
                    },
                });
            }
        }
        // Fetch Workouts scheduled for now
        const workouts = yield prisma_1.default.workout.findMany({
            where: {
                time: currentTime,
                date: today,
            },
            include: {
                workoutAdvice: {
                    include: { user: { include: { subscription: true } } },
                },
            },
        });
        for (const workout of workouts) {
            const user = workout.workoutAdvice.user;
            if (user === null || user === void 0 ? void 0 : user.subscription) {
                yield (0, sendNotification_1.sendNotifications)({
                    subscription: user.subscription,
                    payload: {
                        title: `Workout Time!`,
                        body: `Your ${workout.type} workout is scheduled now. Let’s go!`,
                    },
                });
            }
        }
    });
}
exports.sendFixedTimeNotifications = sendFixedTimeNotifications;
