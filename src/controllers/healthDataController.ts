// import { Request, Response } from "express";
// import { prisma } from "../prisma";

// export const submitBodyMetrics = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.userId;
//     const {
//       weight,
//       bodyFatPercentage,
//       muscleMass,
//       boneMass,
//       waistCircumference,
//       heartRate,
//       sleepDuration,
//     } = req.body;

//     // Create new body metrics record
//     const bodyMetric = await prisma.bodyMetric.create({
//       data: {
//         userId,
//         weight,
//         bodyFatPercentage,
//         muscleMass,
//         boneMass,
//         waistCircumference,
//         // Calculate derived metrics
//         bmi:
//           weight && req.user.userPreferences?.height
//             ? calculateBMI(weight, req.user.userPreferences.height)
//             : undefined,
//         bmr:
//           weight &&
//           req.user.userPreferences?.height &&
//           req.user.userPreferences?.age &&
//           req.user.userPreferences?.gender
//             ? calculateBMR(
//                 weight,
//                 req.user.userPreferences.height,
//                 req.user.userPreferences.age,
//                 req.user.userPreferences.gender
//               )
//             : undefined,
//         tdee:
//           weight &&
//           req.user.userPreferences?.height &&
//           req.user.userPreferences?.activityLevel
//             ? calculateTDEE(
//                 weight,
//                 req.user.userPreferences.height,
//                 req.user.userPreferences.age,
//                 req.user.userPreferences.gender,
//                 req.user.userPreferences.activityLevel
//               )
//             : undefined,
//       },
//       include: {
//         user: {
//           select: {
//             fullName: true,
//             email: true,
//           },
//         },
//       },
//     });

//     // Update user preferences with health data if provided
//     if (heartRate || sleepDuration) {
//       await prisma.userPreferences.update({
//         where: { userId },
//         data: {
//           heartRate,
//           sleepDuration,
//         },
//       });
//     }

//     // Check for health alerts
//     await checkHealthAlerts(userId, bodyMetric);

//     res.status(201).json(bodyMetric);
//   } catch (error) {
//     console.error("Failed to submit body metrics:", error);
//     res.status(500).json({
//       error: "Failed to submit body metrics",
//       details: error instanceof Error ? error.message : undefined,
//     });
//   }
// };

// export const getBodyMetrics = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.userId;
//     const { period = "7d" } = req.query;
//     const dateFilter = getDateFilter(period as string);

//     const metrics = await prisma.bodyMetric.findMany({
//       where: {
//         userId,
//         createdAt: dateFilter,
//       },
//       orderBy: { createdAt: "desc" },
//       include: {
//         user: {
//           select: {
//             fullName: true,
//           },
//         },
//       },
//     });

//     res.json(metrics);
//   } catch (error) {
//     console.error("Failed to get body metrics:", error);
//     res.status(500).json({
//       error: "Failed to get body metrics",
//       details: error instanceof Error ? error.message : undefined,
//     });
//   }
// };

// export const getHealthSummary = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.userId;
//     const { period = "30d" } = req.query;
//     const dateFilter = getDateFilter(period as string);

//     // Get body metrics
//     const metrics = await prisma.bodyMetric.findMany({
//       where: {
//         userId,
//         createdAt: dateFilter,
//       },
//       orderBy: { createdAt: "asc" },
//     });

//     // Get user preferences for health data
//     const preferences = await prisma.userPreferences.findUnique({
//       where: { userId },
//     });

//     // Calculate averages and trends
//     const summary = {
//       weight: calculateTrend(
//         metrics.map((m) => ({ date: m.createdAt, value: m.weight }))
//       ),
//       bodyFat: calculateTrend(
//         metrics.map((m) => ({ date: m.createdAt, value: m.bodyFatPercentage }))
//       ),
//       heartRate: preferences?.heartRate,
//       sleepDuration: preferences?.sleepDuration,
//       bmi: calculateTrend(
//         metrics.map((m) => ({ date: m.createdAt, value: m.bmi }))
//       ),
//       tdee: calculateTrend(
//         metrics.map((m) => ({ date: m.createdAt, value: m.tdee }))
//       ),
//     };

//     res.json(summary);
//   } catch (error) {
//     console.error("Failed to get health summary:", error);
//     res.status(500).json({
//       error: "Failed to get health summary",
//       details: error instanceof Error ? error.message : undefined,
//     });
//   }
// };

// // Helper functions
// function getDateFilter(period: string): Prisma.DateTimeFilter | undefined {
//   const now = new Date();
//   switch (period) {
//     case "24h":
//       return { gte: new Date(now.setDate(now.getDate() - 1)) };
//     case "7d":
//       return { gte: new Date(now.setDate(now.getDate() - 7)) };
//     case "30d":
//       return { gte: new Date(now.setDate(now.getDate() - 30)) };
//     case "all":
//     default:
//       return undefined;
//   }
// }

// function calculateBMI(weight: number, height: number): number {
//   return weight / (height * height);
// }

// function calculateBMR(
//   weight: number,
//   height: number,
//   age: number,
//   gender: string
// ): number {
//   // Mifflin-St Jeor Equation
//   if (gender.toLowerCase() === "male") {
//     return 10 * weight + 6.25 * height * 100 - 5 * age + 5;
//   } else {
//     return 10 * weight + 6.25 * height * 100 - 5 * age - 161;
//   }
// }

// function calculateTDEE(
//   weight: number,
//   height: number,
//   age: number,
//   gender: string,
//   activityLevel: string
// ): number {
//   const bmr = calculateBMR(weight, height, age, gender);
//   const multipliers = {
//     sedentary: 1.2,
//     lightly_active: 1.375,
//     active: 1.55,
//     very_active: 1.725,
//   };
//   return bmr * (multipliers[activityLevel] || 1.2);
// }

// function calculateTrend(data: { date: Date; value: number | null }[]) {
//   const values = data
//     .filter((d) => d.value !== null)
//     .map((d) => d.value as number);
//   if (values.length === 0) return null;

//   return {
//     current: values[values.length - 1],
//     average: values.reduce((a, b) => a + b, 0) / values.length,
//     min: Math.min(...values),
//     max: Math.max(...values),
//     trend: values.length > 1 ? values[values.length - 1] - values[0] : 0,
//   };
// }

// async function checkHealthAlerts(
//   userId: string,
//   metric: Prisma.BodyMetricGetPayload<{}>
// ) {
//   try {
//     const preferences = await prisma.userPreferences.findUnique({
//       where: { userId },
//     });

//     const alerts = [];

//     // Check BMI
//     if (metric.bmi && (metric.bmi < 18.5 || metric.bmi > 24.9)) {
//       alerts.push({
//         type: "BMI_WARNING",
//         message: `Your BMI of ${metric.bmi.toFixed(
//           1
//         )} is outside the healthy range (18.5-24.9)`,
//       });
//     }

//     // Check body fat percentage
//     if (metric.bodyFatPercentage) {
//       const healthyRange =
//         preferences?.gender === "male"
//           ? { min: 8, max: 19 }
//           : { min: 21, max: 33 };

//       if (
//         metric.bodyFatPercentage < healthyRange.min ||
//         metric.bodyFatPercentage > healthyRange.max
//       ) {
//         alerts.push({
//           type: "BODY_FAT_WARNING",
//           message: `Your body fat percentage of ${metric.bodyFatPercentage.toFixed(
//             1
//           )}% is outside the healthy range for your gender`,
//         });
//       }
//     }

//     // Create notifications for any alerts
//     if (alerts.length > 0) {
//       await Promise.all(
//         alerts.map((alert) =>
//           prisma.notification.create({
//             data: {
//               userId,
//               title: "Health Alert",
//               message: alert.message,
//               type: alert.type,
//               referenceId: metric.id,
//             },
//           })
//         )
//       );
//     }
//   } catch (error) {
//     console.error("Failed to check health alerts:", error);
//   }
// }
