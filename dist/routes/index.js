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
const express_1 = require("express");
const userRoute_1 = __importDefault(require("./userRoute"));
const mealPlanRoute_1 = __importDefault(require("./mealPlanRoute"));
const workoutRoute_1 = __importDefault(require("./workoutRoute"));
const recoveryRoute_1 = __importDefault(require("./recoveryRoute"));
const notificationRoute_1 = __importDefault(require("./notificationRoute"));
const geminiChatBotRouter_1 = __importDefault(require("./geminiChatBotRouter"));
const userAuth_1 = require("../middleware/userAuth");
const prisma_1 = __importDefault(require("../prisma"));
// import { sendNotifications } from "../notifications/sendNotification";
// import healthDataRouter from "./healthDataRoute";
const router = (0, express_1.Router)();
router.use("/user", userRoute_1.default);
router.use("/meal-plans", mealPlanRoute_1.default);
router.use("/workouts", workoutRoute_1.default);
router.use("/recovery", recoveryRoute_1.default);
router.use("/notifications", notificationRoute_1.default);
router.use("/geminiChatBot", geminiChatBotRouter_1.default);
router.post("/save-subscription", userAuth_1.userAuthorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { subscription } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        yield prisma_1.default.subscription.upsert({
            where: { userId },
            update: {
                auth: subscription.keys.auth,
                p256dh: subscription.keys.p256dh,
                endpoint: subscription.endpoint,
            },
            create: {
                userId,
                auth: subscription.keys.auth,
                p256dh: subscription.keys.p256dh,
                endpoint: subscription.endpoint,
            },
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
}));
// router.use("/health-data", healthDataRouter);
// router.get("/test-notification", async (req, res) => {
//   const subscriptions = await prisma.subscription.findMany();
//   for (const sub of subscriptions) {
//     sendNotifications(sub, {
//       title: "Test Notification",
//       body: "It works! 🎉",
//     });
//   }
//   res.send("Notifications sent.");
// });
exports.default = router;
