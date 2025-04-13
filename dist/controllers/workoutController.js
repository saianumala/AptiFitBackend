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
exports.getWorkoutRecovery = exports.getWorkoutHistory = exports.logWorkoutCompletion = exports.getTodaysWorkout = exports.generateWorkoutPlan = void 0;
const prisma_1 = require("../prisma");
const personalisedAi_1 = require("../utils/personalisedAi");
const generateWorkoutPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Get user preferences for personalized workout generation
        const user = yield prisma_1.prisma.user.findUnique({
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
        (0, personalisedAi_1.generateWorkoutAdvice)({
            userPreferences: user.userPreferences,
            bodyMetrics: Array.isArray(user.bodyMetrics)
                ? user.bodyMetrics[0]
                : user.bodyMetrics,
        }).then((workoutAdvice) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            return (generatedWorkout = yield prisma_1.prisma.workoutAdvice.create({
                data: {
                    userId,
                    summary: workoutAdvice.summary,
                    frequency: workoutAdvice.frequency,
                    type: workoutAdvice.type,
                    workouts: {
                        create: ((_a = workoutAdvice.workouts) === null || _a === void 0 ? void 0 : _a.map((w) => ({
                            date: new Date(),
                            time: w.time,
                            type: w.type,
                            targetMuscles: w.targetMuscles,
                            duration: w.duration,
                            order: w.order,
                            Exercise: {
                                create: w.exercises.map((exercise) => ({
                                    name: exercise.name,
                                    type: exercise.type,
                                    sets: exercise.sets,
                                    reps: exercise.reps,
                                    restTime: exercise.restTime,
                                })),
                            },
                        }))) || [],
                    },
                },
            }));
        }));
        res.status(201).json(generatedWorkout);
    }
    catch (error) {
        console.error("Failed to generate workout plan:", error);
        res.status(500).json({ error: "Failed to generate workout plan" });
    }
});
exports.generateWorkoutPlan = generateWorkoutPlan;
const getTodaysWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const workoutAdvice = yield prisma_1.prisma.workoutAdvice.findFirst({
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
    }
    catch (error) {
        console.error("Failed to fetch today's workout:", error);
        res.status(500).json({ error: "Failed to fetch today's workout" });
    }
});
exports.getTodaysWorkout = getTodaysWorkout;
const logWorkoutCompletion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { workoutId, completed } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Verify workout exists
        const workout = yield prisma_1.prisma.workout.findUnique({
            where: { id: workoutId },
        });
        if (!workout) {
            res.status(404).json({ error: "Workout not found" });
            return;
        }
        const workoutLog = yield prisma_1.prisma.workoutLog.create({
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
            yield prisma_1.prisma.recoveryAction.create({
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
                    },
                    status: "PENDING",
                },
            });
            // Send notification
            yield prisma_1.prisma.notification.create({
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
    }
    catch (error) {
        console.error("Failed to log workout:", error);
        res.status(500).json({ error: "Failed to log workout" });
    }
});
exports.logWorkoutCompletion = logWorkoutCompletion;
const getWorkoutHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { days = 30 } = req.query;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - Number(days));
        const history = yield prisma_1.prisma.workoutLog.findMany({
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
    }
    catch (error) {
        console.error("Failed to fetch workout history:", error);
        res.status(500).json({ error: "Failed to fetch workout history" });
    }
});
exports.getWorkoutHistory = getWorkoutHistory;
const getWorkoutRecovery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const recoveryActions = yield prisma_1.prisma.recoveryAction.findMany({
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
    }
    catch (error) {
        console.error("Failed to fetch recovery actions:", error);
        res.status(500).json({ error: "Failed to fetch recovery actions" });
    }
});
exports.getWorkoutRecovery = getWorkoutRecovery;
