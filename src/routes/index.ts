import { Request, Response, Router } from "express";
import userRouter from "./userRoute";
import mealPlanRouter from "./mealPlanRoute";
import workoutRouter from "./workoutRoute";
import recoveryRouter from "./recoveryRoute";
import notificationRouter from "./notificationRoute";
import geminiChatbotRouter from "./geminiChatBotRouter";
import { userAuthorization } from "../middleware/userAuth";
import prisma from "../prisma";
import { sendNotifications } from "../notifications/sendNotification";

// import healthDataRouter from "./healthDataRoute";

const router = Router();

router.use("/user", userRouter);
router.use("/meal-plans", mealPlanRouter);
router.use("/workouts", workoutRouter);
router.use("/recovery", recoveryRouter);
router.use("/notifications", notificationRouter);
router.use("/geminiChatBot", geminiChatbotRouter);
router.post(
  "/save-subscription",
  userAuthorization,
  async (req: Request, res: Response) => {
    const { subscription } = req.body;
    const userId = req.user?.userId;
    try {
      await prisma.subscription.upsert({
        where: { endpoint: subscription.endpoint },
        update: {
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
        },
        create: {
          userId,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          endpoint: subscription.endpoint,
        },
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ errorMessage: error.message });
    }
  }
);
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

export default router;
