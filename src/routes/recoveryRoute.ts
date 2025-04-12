import { Router } from "express";
import {
  getPendingRecoveryActions,
  getRecoveryPlans,
  updateRecoveryActionStatus,
} from "../controllers/recoveryController";
import { userAuthorization } from "../middleware/userAuth";

const router = Router();

router.get("/actions", userAuthorization, getPendingRecoveryActions);
router.patch("/actions/:id", userAuthorization, updateRecoveryActionStatus);
router.get("/adaptive-plans", userAuthorization, getRecoveryPlans);

export default router;
