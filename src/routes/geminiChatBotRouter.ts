import { Router } from "express";
import { userAuthorization } from "../middleware/userAuth";
import {
  createChatMessage,
  deleteChatMessage,
  getChatMessageById,
  getChatMessages,
  updateChatMessage,
} from "../controllers/geminichatbotController";

const router = Router();

router.post("/createChat", userAuthorization, createChatMessage);

router.get("/getChat", userAuthorization, getChatMessages);

router.get("/:id", userAuthorization, getChatMessageById);

router.put("/:id", userAuthorization, updateChatMessage);

router.delete("/:id", userAuthorization, deleteChatMessage);

export default router;
