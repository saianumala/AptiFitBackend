"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMissed = exports.isTimeMatch = exports.isTimeToNotify = void 0;
function isTimeToNotify(frequency, lastNotifiedAt) {
    const now = new Date();
    if (!lastNotifiedAt)
        return true;
    const last = new Date(lastNotifiedAt);
    const diffMinutes = (now.getTime() - last.getTime()) / (1000 * 60);
    return diffMinutes >= frequency;
}
exports.isTimeToNotify = isTimeToNotify;
function isTimeMatch(storedTime, currentTime) {
    return storedTime === currentTime;
}
exports.isTimeMatch = isTimeMatch;
function isMissed(storedTime, now, logStatus) {
    if (logStatus === "completed")
        return false;
    const [hour, minute] = storedTime.split(":").map(Number);
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hour);
    scheduledTime.setMinutes(minute);
    scheduledTime.setSeconds(0);
    const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
    return diffMinutes > 30 && diffMinutes < 60;
}
exports.isMissed = isMissed;
