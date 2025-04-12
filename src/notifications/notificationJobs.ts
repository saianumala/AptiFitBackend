import cron from "node-cron";
import webpush from "web-push";
import { sendFrequencyNotifications } from "./sendFrequencyNotifications";
// import { sendMissedActivityNotifications } from "./sendMissedActivityNotifications";
import { sendFixedTimeNotifications } from "./sendFixedTimeNotifications";

// 1. Every 5 minutes => Frequency-based
cron.schedule("*/2 * * * *", () => {
  console.log("scheduled notification");
  sendFrequencyNotifications();
});

// 2. Every minute => Fixed-time reminders
cron.schedule("* * * * *", () => {
  console.log("fixed notifications");

  sendFixedTimeNotifications();
});

// 3. Every 15 minutes => Missed reminders
// cron.schedule("*/15 * * * *", () => {
//   sendMissedActivityNotifications();
// });
