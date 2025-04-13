"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotifications = void 0;
const web_push_1 = __importDefault(require("web-push"));
function sendNotifications({ subscription, payload, }) {
    web_push_1.default.setVapidDetails("mailto:anumalansk@gmail.com", process.env.VAPID_PUBLIC_KEY || "", process.env.VAPID_PRIVATE_KEY || "");
    if (!subscription)
        return;
    const pushPayload = JSON.stringify(payload);
    return web_push_1.default.sendNotification({
        endpoint: subscription.endpoint,
        keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh,
        },
    }, pushPayload);
}
exports.sendNotifications = sendNotifications;
