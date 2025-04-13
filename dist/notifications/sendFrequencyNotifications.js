"use strict";
// import prisma from "../prisma";
// // import { sendNotifications } from "./sendNotification";
// import { isTimeToNotify } from "../utils/timeUtils";
// import { personalisedAi } from "../utils/personalisedAi";
// export async function sendFrequencyNotifications() {
//   const users = await prisma.user.findMany({
//     where: {
//       userPreferences: {
//         isNot: null,
//       },
//     },
//     select: {
//       userId: true,
//       lastNotifiedAt: true,
//       subscription: true,
//       userPreferences: true,
//       timeZone: true,
//       bodyMetrics: {
//         orderBy: {
//           createdAt: "desc",
//         },
//         take: 1,
//       },
//       ConsumedMeals: {
//         orderBy: {
//           createdAt: "desc",
//         },
//         take: 2,
//       },
//     },
//   });
//   for (const user of users) {
//     const { notificationFrequency } = user.userPreferences!;
//     if (
//       notificationFrequency &&
//       user.subscription &&
//       isTimeToNotify(notificationFrequency, user.lastNotifiedAt)
//     ) {
//       const data = await personalisedAi({
//         updatedUser: {
//           bodyMetrics: user.bodyMetrics[0],
//           userPreferences: user.userPreferences!,
//           ConsumedMeals: user.ConsumedMeals,
//         },
//         category: "notification",
//       });
//       console.log(data);
//       const payload = {
//         title: data.title,
//         body: data.body,
//       };
//       try {
//         await sendNotifications({
//           subscription: user.subscription,
//           payload: payload,
//         });
//         await prisma.user.update({
//           where: { userId: user.userId },
//           data: { lastNotifiedAt: new Date() },
//         });
//       } catch (error) {
//         console.error("Failed to send frequency-based notification:", error);
//       }
//     }
//   }
// }
