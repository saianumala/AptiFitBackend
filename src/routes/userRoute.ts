import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  login,
  loginCheck,
  logout,
  updateUser,
  // getUserAnalytics,
} from "../controllers/userController";

import userPreferencesRouter from "./userPreferencesRoute";
import { userAuthorization } from "../middleware/userAuth";

const router = Router();

router.use("/preferences", userPreferencesRouter);

router.get("/", getUser);
router.post("/register", createUser);
router.post("/login", login);
router.post("/logout", userAuthorization, logout);
router.patch("/update", userAuthorization, updateUser);
router.delete("/delete", userAuthorization, deleteUser);
router.get("/isLoggedIn", userAuthorization, loginCheck);
// router.get("/analytics", userAuthorization, getUserAnalytics);

export default router;

// collect user data generate a diet plan, workout plan, calculate body metrics
// interactive chat via chat or verbal
