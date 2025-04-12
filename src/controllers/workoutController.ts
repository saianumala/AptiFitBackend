import { Request, Response } from "express";
import { prisma } from "../prisma";
import { generateWithAI, generateWorkoutAdvice } from "../utils/personalisedAi";
import { Prisma } from "@prisma/client";

interface GeneratedWorkout {
  name: string;
  description: string;
  duration: number;
  frequency: string;
  type: string;
  summary: string;
  workouts: {
    day: number;
    name: string;
    type: string;
    targetMuscles: string[];
    duration: number;
    sets?: number;
    reps?: number;
    restTime?: number;
    order: number;
  }[];
}

export const generateWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Get user preferences for personalized workout generation
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userPreferences: true,
        bodyMetrics: true,
      },
    });

    if (!user || !user.userPreferences) {
      res.status(400).json({ error: "User preferences not found" });
      return;
    }

    // Generate workout plan using AI
    let generatedWorkout;
    generateWorkoutAdvice({
      userPreferences: user.userPreferences,
      bodyMetrics: Array.isArray(user.bodyMetrics)
        ? user.bodyMetrics[0]
        : user.bodyMetrics,
    }).then(
      async (workoutAdvice) =>
        (generatedWorkout = await prisma.workoutAdvice.create({
          data: {
            userId,

            summary: workoutAdvice.summary,
            frequency: workoutAdvice.frequency,
            type: workoutAdvice.type,
            workouts: {
              create:
                workoutAdvice.workouts?.map((w: any) => ({
                  date: new Date(),
                  time: w.time,
                  type: w.type,
                  targetMuscles: w.targetMuscles,
                  duration: w.duration,
                  order: w.order,
                  Exercise: {
                    create: w.exercises.map((exercise: any) => ({
                      name: exercise.name,
                      type: exercise.type,
                      sets: exercise.sets,
                      reps: exercise.reps,
                      restTime: exercise.restTime,
                    })),
                  },
                })) || [],
            },
          },
        }))
    );

    res.status(201).json(generatedWorkout);
  } catch (error) {
    console.error("Failed to generate workout plan:", error);
    res.status(500).json({ error: "Failed to generate workout plan" });
  }
};

export const getTodaysWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const workoutAdvice = await prisma.workoutAdvice.findFirst({
      where: {
        userId,
        active: true,
      },
      include: {
        workouts: {
          where: {
            date: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!workoutAdvice) {
      return res.status(404).json({ error: "No active workout plan found" });
    }

    res.json({
      advice: {
        id: workoutAdvice.id,
        summary: workoutAdvice.summary,
      },
      workouts: workoutAdvice.workouts,
    });
  } catch (error) {
    console.error("Failed to fetch today's workout:", error);
    res.status(500).json({ error: "Failed to fetch today's workout" });
  }
};

export const logWorkoutCompletion = async (req: Request, res: Response) => {
  try {
    const { workoutId, completed } = req.body;
    const userId = req.user?.userId;

    // Verify workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      res.status(404).json({ error: "Workout not found" });
      return;
    }

    const workoutLog = await prisma.workoutLog.create({
      data: {
        workoutId,
        userId,
        completed,
        date: new Date(),
      },
      include: {
        workout: true,
      },
    });

    // Generate recovery action if workout wasn't completed
    if (!completed) {
      await prisma.recoveryAction.create({
        data: {
          userId,
          sourceType: "WORKOUT_MISSED",

          actions: {
            suggestedWorkouts: [
              {
                type: workout.type,
                duration: workout.duration,
              },
            ],
            alternativeExercises: [],
          } as Prisma.JsonObject,
          status: "PENDING",
        },
      });

      // Send notification
      await prisma.notification.create({
        data: {
          userId,
          title: "Missed Workout",
          message: `You missed your workout. We've created recovery actions.`,
          type: "workout_reminder",
          referenceId: workoutId,
        },
      });
    }

    res.status(201).json(workoutLog);
  } catch (error) {
    console.error("Failed to log workout:", error);
    res.status(500).json({ error: "Failed to log workout" });
  }
};

export const getWorkoutHistory = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user?.userId;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - Number(days));

    const history = await prisma.workoutLog.findMany({
      where: {
        userId,
        date: { gte: dateThreshold },
      },
      orderBy: { date: "desc" },
      include: {
        workout: {
          select: {
            type: true,
            duration: true,
            targetMuscles: true,
          },
        },
      },
    });

    res.json(history);
  } catch (error) {
    console.error("Failed to fetch workout history:", error);
    res.status(500).json({ error: "Failed to fetch workout history" });
  }
};

export const getWorkoutRecovery = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const recoveryActions = await prisma.recoveryAction.findMany({
      where: {
        userId,
        sourceType: "WORKOUT_MISSED",
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(recoveryActions);
  } catch (error) {
    console.error("Failed to fetch recovery actions:", error);
    res.status(500).json({ error: "Failed to fetch recovery actions" });
  }
};
