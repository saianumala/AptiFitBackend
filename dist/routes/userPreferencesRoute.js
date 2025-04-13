"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userPreferencesController_1 = require("../controllers/userPreferencesController");
const userAuth_1 = require("../middleware/userAuth");
const router = (0, express_1.Router)();
router.get("/", userPreferencesController_1.getPreferences);
router.post("/create", userAuth_1.userAuthorization, userPreferencesController_1.createPreferences);
router.patch("/update", userAuth_1.userAuthorization, userPreferencesController_1.updatePreferences);
router.delete("/delete", userAuth_1.userAuthorization, userPreferencesController_1.deletePreferences);
// router.get("/recommendations", userAuthorization, getRecommendationSettings);
// router.patch(
//   "/recommendations",
//   userAuthorization,
//   updateRecommendationSettings
// );
exports.default = router;
