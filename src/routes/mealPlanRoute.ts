import { Router } from "express";
import {
  generateDailyPlan,
  getCurrentPlan,
  // getPlanHistory,
  trackMealConsumption,
  trackAdHocMeal,
  // skipPlannedMeal,
  getNutritionSummary,
} from "../controllers/mealPlanController";
import { userAuthorization } from "../middleware/userAuth";
import { multerUploadMiddleware } from "../middleware/multerUploader";

const router = Router();

// Plan generation
router.post("/generate", userAuthorization, generateDailyPlan);
router.get("/current", userAuthorization, getCurrentPlan);
// router.get("/history", userAuthorization, getPlanHistory);

// Meal tracking
router.post("/track-planned", userAuthorization, trackMealConsumption);
router.post(
  "/track-adhoc",
  userAuthorization,
  multerUploadMiddleware("image"),
  trackAdHocMeal
);
// router.post("/skip/:planId/:mealId", userAuthorization, skipPlannedMeal);

// Analytics
router.get(
  "/nutrition-summary/:date",
  userAuthorization,

  getNutritionSummary
);

export default router;
