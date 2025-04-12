import { Request, Response } from "express";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { limit = 20, unreadOnly } = req.query;
    const userId = req.user?.userId; // Updated to match your schema's userId field

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly === "true" ? { read: false } : {}),
      },
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
  } catch (error) {
    console.error("Failed to get notifications:", error);
    res.status(500).json({
      error: "Failed to get notifications",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    console.log("reached mark notification read");

    const notification = await prisma.notification.update({
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
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
    });
    res.json({ notifications: notifications });
  } catch (error: any) {
    console.error("Failed to mark notification as read:", error);
    res.status(500).json({
      error: "Failed to mark notification as read",
      details:
        error instanceof Prisma.PrismaClientKnownRequestError
          ? error.meta
          : undefined,
    });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const { count } = await prisma.notification.updateMany({
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
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

export const dismissNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notification = await prisma.notification.delete({
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
  } catch (error: any) {
    console.error("Failed to dismiss notification:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.status(500).json({
      error: "Failed to dismiss notification",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type, referenceId, actions } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        referenceId,
        actions: actions as Prisma.JsonObject,
        read: false,
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("Failed to create notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};
