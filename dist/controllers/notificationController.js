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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.dismissNotification = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getUserNotifications = void 0;
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const getUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { limit = 20, unreadOnly } = req.query;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Updated to match your schema's userId field
        const notifications = yield prisma_1.prisma.notification.findMany({
            where: Object.assign({ userId }, (unreadOnly === "true" ? { read: false } : {})),
            orderBy: { createdAt: "desc" },
            take: Number(limit),
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        res.json(notifications);
    }
    catch (error) {
        console.error("Failed to get notifications:", error);
        res.status(500).json({
            error: "Failed to get notifications",
            details: error instanceof Error ? error.message : undefined,
        });
    }
});
exports.getUserNotifications = getUserNotifications;
const markNotificationRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        console.log("reached mark notification read");
        const notification = yield prisma_1.prisma.notification.update({
            where: {
                id,
                userId, // Ensures users can only update their own notifications
            },
            data: {
                read: true,
                updatedAt: new Date(), // Explicitly update the timestamp
            },
        });
        if (!notification) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }
        const notifications = yield prisma_1.prisma.notification.findMany({
            where: {
                userId: userId,
            },
        });
        res.json({ notifications: notifications });
    }
    catch (error) {
        console.error("Failed to mark notification as read:", error);
        res.status(500).json({
            error: "Failed to mark notification as read",
            details: error instanceof client_1.Prisma.PrismaClientKnownRequestError
                ? error.meta
                : undefined,
        });
    }
});
exports.markNotificationRead = markNotificationRead;
const markAllNotificationsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { count } = yield prisma_1.prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
                updatedAt: new Date(),
            },
        });
        res.json({
            success: true,
            markedRead: count,
        });
    }
    catch (error) {
        console.error("Failed to mark all notifications as read:", error);
        res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
});
exports.markAllNotificationsRead = markAllNotificationsRead;
const dismissNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const notification = yield prisma_1.prisma.notification.delete({
            where: {
                id,
                userId, // Ensures users can only delete their own notifications
            },
        });
        if (!notification) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }
        res.status(204).end();
    }
    catch (error) {
        console.error("Failed to dismiss notification:", error);
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025") {
            res.status(404).json({ error: "Notification not found" });
            return;
        }
        res.status(500).json({
            error: "Failed to dismiss notification",
            details: error instanceof Error ? error.message : undefined,
        });
    }
});
exports.dismissNotification = dismissNotification;
const createNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, title, message, type, referenceId, actions } = req.body;
        const notification = yield prisma_1.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                referenceId,
                actions: actions,
                read: false,
            },
        });
        res.status(201).json(notification);
    }
    catch (error) {
        console.error("Failed to create notification:", error);
        res.status(500).json({ error: "Failed to create notification" });
    }
});
exports.createNotification = createNotification;
