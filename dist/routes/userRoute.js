"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const userPreferencesRoute_1 = __importDefault(require("./userPreferencesRoute"));
const userAuth_1 = require("../middleware/userAuth");
const router = (0, express_1.Router)();
router.use("/preferences", userPreferencesRoute_1.default);
router.get("/", userController_1.getUser);
router.post("/register", userController_1.createUser);
router.post("/login", userController_1.login);
router.post("/logout", userAuth_1.userAuthorization, userController_1.logout);
router.patch("/update", userAuth_1.userAuthorization, userController_1.updateUser);
router.delete("/delete", userAuth_1.userAuthorization, userController_1.deleteUser);
router.get("/isLoggedIn", userAuth_1.userAuthorization, userController_1.loginCheck);
// router.get("/analytics", userAuthorization, getUserAnalytics);
exports.default = router;
// collect user data generate a diet plan, workout plan, calculate body metrics
// interactive chat via chat or verbal
