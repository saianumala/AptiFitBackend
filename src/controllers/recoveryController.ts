import { Request, Response } from "express";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { generateWithAI } from "../utils/personalisedAi";

export const getPendingRecoveryActions = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId; // Updated to match schema's userId field

    const actions = await prisma.recoveryAction.findMany({
      where: {
        userId,
        status: "PENDING", // Using enum value from schema
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(actions);
  } catch (error) {
    console.error("Failed to get recovery actions:", error);
    res.status(500).json({
      error: "Failed to get recovery actions",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};

export const updateRecoveryActionStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    // Validate status against enum
    if (!Object.values(ActionStatus).includes(status)) {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }

    const updatedAction = await prisma.recoveryAction.update({
      where: {
        id,
        userId, // Ensure users can only update their own actions
      },
      data: {
        status,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!updatedAction) {
      res.status(404).json({ error: "Recovery action not found" });
    }

    // If skipped, generate adaptive plan
    // if (status === "SKIPPED") {
    //   await generateAdaptivePlan(userId, updatedAction.id);

    //   // Create notification
    //   await prisma.notification.create({
    //     data: {
    //       userId,
    //       title: "Recovery Plan Updated",
    //       message:
    //         "We've created an adaptive plan based on your skipped recovery action.",
    //       type: "recovery_update",
    //       referenceId: updatedAction.id,
    //     },
    //   });
    // }

    res.json(updatedAction);
  } catch (error) {
    console.error("Failed to update recovery action:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ error: "Recovery action not found" });
      return;
    }

    res.status(500).json({
      error: "Failed to update recovery action",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};

export const getRecoveryPlans = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { limit = 5 } = req.query;

    // In your schema, RecoveryAction serves as the recovery plan
    const plans = await prisma.recoveryAction.findMany({
      where: {
        userId,
        status: { not: "PENDING" }, // Get completed/skipped actions
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: Number(limit),
    });

    res.json(plans);
  } catch (error) {
    console.error("Failed to get recovery plans:", error);
    res.status(500).json({
      error: "Failed to get recovery plans",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};

// async function generateAdaptivePlan(userId: string, actionId: string) {
//   try {
//     const action = await prisma.recoveryAction.findUnique({
//       where: { id: actionId },
//     });

//     if (!action) {
//       throw new Error("Recovery action not found");
//     }

//     const user = await prisma.user.findUnique({
//       where: { userId },
//       include: {
//         userPreferences: true,
//         bodyMetrics: {
//           orderBy: { createdAt: "desc" },
//           take: 1,
//         },
//       },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     const prompt = `Create adaptive recovery plan because user skipped action: ${JSON.stringify(
//       action.actions
//     )}. User preferences: ${JSON.stringify(
//       user.userPreferences
//     )}. Latest metrics: ${JSON.stringify(user.bodyMetrics[0])}`;

//     const generatedPlan = await generateWithAI({
//       userId: userId,
//       taskType:"adaptive-recovery",
//       customPrompt:prompt}
//     );

//     // Store the generated plan as a new recovery action
//     return await prisma.recoveryAction.create({
//       data: {
//         userId,
//         sourceType: "ADAPTIVE_RECOVERY",
//         sourceId: actionId,
//         actions: generatedPlan as Prisma.JsonObject,
//         status: "PENDING",
//       },
//     });
//   } catch (error) {
//     console.error("Failed to generate adaptive plan:", error);
//     throw error;
//   }
// }

// Helper enum to match your schema
enum ActionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
}
