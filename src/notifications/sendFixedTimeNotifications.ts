// import prisma from "../prisma";
// import { sendNotifications } from "./sendNotification";

// export async function sendFixedTimeNotifications() {
//   const now = new Date();
//   const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
//   const today = new Date(now.toDateString());

//   // Fetch Meals scheduled for now
//   const meals = await prisma.meal.findMany({
//     where: {
//       time: currentTime,
//       mealPlan: { date: today },
//     },
//     include: {
//       mealPlan: {
//         include: { user: { include: { subscription: true } } },
//       },
//     },
//   });

//   for (const meal of meals) {
//     const user = meal?.mealPlan?.user;
//     if (user?.subscription) {
//       await sendNotifications({
//         subscription: user.subscription,
//         payload: {
//           title: `${meal.type} Time!`,
//           body: `It's time for your ${meal.name}. Enjoy your meal!`,
//         },
//       });
//     }
//   }

//   // Fetch Workouts scheduled for now
//   const workouts = await prisma.workout.findMany({
//     where: {
//       time: currentTime,
//       date: today,
//     },
//     include: {
//       workoutAdvice: {
//         include: { user: { include: { subscription: true } } },
//       },
//     },
//   });

//   for (const workout of workouts) {
//     const user = workout.workoutAdvice.user;
//     if (user?.subscription) {
//       await sendNotifications({
//         subscription: user.subscription,
//         payload: {
//           title: `Workout Time!`,
//           body: `Your ${workout.type} workout is scheduled now. Let’s go!`,
//         },
//       });
//     }
//   }
// }
