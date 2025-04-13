"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mealPlanController_1 = require("../controllers/mealPlanController");
const userAuth_1 = require("../middleware/userAuth");
const multerUploader_1 = require("../middleware/multerUploader");
const router = (0, express_1.Router)();
// Plan generation
router.post("/generate", userAuth_1.userAuthorization, mealPlanController_1.generateDailyPlan);
router.get("/current", userAuth_1.userAuthorization, mealPlanController_1.getCurrentPlan);
// router.get("/history", userAuthorization, getPlanHistory);
// Meal tracking
router.post("/track-planned", userAuth_1.userAuthorization, mealPlanController_1.trackMealConsumption);
router.post("/track-adhoc", userAuth_1.userAuthorization, (0, multerUploader_1.multerUploadMiddleware)("image"), mealPlanController_1.trackAdHocMeal);
// router.post("/skip/:planId/:mealId", userAuthorization, skipPlannedMeal);
// Analytics
router.get("/nutrition-summary/:date", userAuth_1.userAuthorization, mealPlanController_1.getNutritionSummary);
exports.default = router;
