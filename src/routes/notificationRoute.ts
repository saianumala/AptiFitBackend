import { Router } from "express";
import {
  getUserNotifications,
  dismissNotification,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController";
import { userAuthorization } from "../middleware/userAuth";

const router = Router();

router.get("/", userAuthorization, getUserNotifications);
router.patch("/read-all", userAuthorization, markAllNotificationsRead);
router.patch("/read/:id", userAuthorization, markNotificationRead);
router.delete("/:id", userAuthorization, dismissNotification);

export default router;
