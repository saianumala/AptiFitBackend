import { Router } from "express";
import {
  generateWorkoutPlan,
  logWorkoutCompletion,
  getWorkoutHistory,
  getWorkoutRecovery,
} from "../controllers/workoutController";
import { userAuthorization } from "../middleware/userAuth";

const router = Router();

router.post("/generate", userAuthorization, generateWorkoutPlan);
router.post("/log", userAuthorization, logWorkoutCompletion);
router.get("/history", userAuthorization, getWorkoutHistory);
router.get("/recovery/:logId", userAuthorization, getWorkoutRecovery);

export default router;
