"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChatMessage = exports.updateChatMessage = exports.getChatMessageById = exports.getChatMessages = exports.createChatMessage = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const geminiChatbot_1 = require("../utils/geminiChatbot");
const personalisedAi_1 = require("../utils/personalisedAi");
const createChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { message } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        // Store user message
        yield prisma_1.default.chatMessage.create({
            data: {
                userId,
                role: "user",
                message,
            },
        });
        // Generate prompt with user context
        let prompt = yield (0, geminiChatbot_1.generateUserContext)({ userData: req.user });
        prompt += `Based on the details above, respond to the following user message: "${message}"
        Ensure your response considers:
        - The user's preferences (cuisine, workout type, health goals, etc.).
        - Their body metrics (BMI, BMR, TDEE, etc.).
        - Their planned meals and any deviations from them.
        - Their workout plan and any recovery actions suggested.
        - The current time and location for relevant suggestions (e.g., meal timing, workout scheduling).

        Provide a concise yet comprehensive answer that directly addresses the user's query while leveraging their profile information for personalization. If the user's message is a general question, use the profile to provide contextually relevant information or suggestions. If the message relates to a specific aspect of their plan (meal, workout, recovery), prioritize information from that section.
        give the response in a json format like this {
          response: ""       
        }
        `;
        const response = yield (0, personalisedAi_1.geminiChatbot)(prompt);
        console.log(response);
        // Store bot response
        const createdMessage = yield prisma_1.default.chatMessage.create({
            data: {
                userId,
                role: "bot",
                message: response.response,
            },
        });
        res.status(200).json({ message: createdMessage.message });
    }
    catch (error) {
        res.status(500).json({ errorMessage: error.message, error });
    }
});
exports.createChatMessage = createChatMessage;
const getChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    try {
        console.log(userId);
        const messages = yield prisma_1.default.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
            select: {
                role: true,
                message: true,
            },
        });
        console.log(messages);
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
});
exports.getChatMessages = getChatMessages;
const getChatMessageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { id } = req.params;
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId;
    try {
        const message = yield prisma_1.default.chatMessage.findFirst({
            where: { id, userId },
        });
        if (!message) {
            res.status(404).json({ error: "Message not found" });
            return;
        }
        res.status(200).json(message);
    }
    catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
});
exports.getChatMessageById = getChatMessageById;
const updateChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { id } = req.params;
    const { message } = req.body;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId;
    try {
        const updated = yield prisma_1.default.chatMessage.updateMany({
            where: { id, userId },
            data: { message },
        });
        if (updated.count === 0) {
            res.status(404).json({ error: "Message not found or unauthorized" });
            return;
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
});
exports.updateChatMessage = updateChatMessage;
const deleteChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { id } = req.params;
    const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e.userId;
    try {
        const deleted = yield prisma_1.default.chatMessage.deleteMany({
            where: { id, userId },
        });
        if (deleted.count === 0) {
            res.status(404).json({ error: "Message not found or unauthorized" });
            return;
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
});
exports.deleteChatMessage = deleteChatMessage;
