"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const sendFrequencyNotifications_1 = require("./sendFrequencyNotifications");
// import { sendMissedActivityNotifications } from "./sendMissedActivityNotifications";
const sendFixedTimeNotifications_1 = require("./sendFixedTimeNotifications");
// 1. Every 5 minutes => Frequency-based
node_cron_1.default.schedule("*/2 * * * *", () => {
    console.log("scheduled notification");
    (0, sendFrequencyNotifications_1.sendFrequencyNotifications)();
});
// 2. Every minute => Fixed-time reminders
node_cron_1.default.schedule("* * * * *", () => {
    console.log("fixed notifications");
    (0, sendFixedTimeNotifications_1.sendFixedTimeNotifications)();
});
// 3. Every 15 minutes => Missed reminders
// cron.schedule("*/15 * * * *", () => {
//   sendMissedActivityNotifications();
// });
