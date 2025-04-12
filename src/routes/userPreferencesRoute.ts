import { Router } from "express";
import {
  createPreferences,
  deletePreferences,
  getPreferences,
  updatePreferences,
  // getRecommendationSettings,
  // updateRecommendationSettings,
} from "../controllers/userPreferencesController";
import { userAuthorization } from "../middleware/userAuth";

const router = Router();

router.get("/", getPreferences);
router.post("/create", userAuthorization, createPreferences);
router.patch("/update", userAuthorization, updatePreferences);
router.delete("/delete", userAuthorization, deletePreferences);
// router.get("/recommendations", userAuthorization, getRecommendationSettings);
// router.patch(
//   "/recommendations",
//   userAuthorization,
//   updateRecommendationSettings
// );

export default router;
