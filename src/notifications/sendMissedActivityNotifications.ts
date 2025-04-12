// import prisma from "../prisma";

// export async function sendMissedActivityNotifications() {
//   const users = await prisma.user.findMany({
//     where: { schedule: { isNot: null }, logs: { some: {} } },
//     include: {
//       subscription: true,
//       schedule: true,
//       logs: true,
//     },
//   });

//   const now = new Date();

//   for (const user of users) {
//     const schedule = user.schedule!;
//     const logs = user.logs;

//     for (const [activity, time] of Object.entries(schedule)) {
//       const [hour, minute] = time.split(":").map(Number);
//       const scheduledTime = new Date(now);
//       scheduledTime.setHours(hour);
//       scheduledTime.setMinutes(minute);
//       scheduledTime.setSeconds(0);

//       const diff = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);

//       const recentLog = logs.find(
//         (log) =>
//           log.activity === activity &&
//           new Date(log.date).toDateString() === now.toDateString()
//       );

//       if (
//         diff > 30 &&
//         diff < 60 &&
//         (!recentLog || recentLog.status !== "completed")
//       ) {
//         await sendNotification(user.subscription, {
//           title: `${activity} missed`,
//           body: `You missed your ${activity}. Try to catch up.`,
//         });
//       }
//     }
//   }
// }
