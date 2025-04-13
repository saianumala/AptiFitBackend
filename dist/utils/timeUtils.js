"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTimeToNotify = isTimeToNotify;
exports.isTimeMatch = isTimeMatch;
exports.isMissed = isMissed;
function isTimeToNotify(frequency, lastNotifiedAt) {
    const now = new Date();
    if (!lastNotifiedAt)
        return true;
    const last = new Date(lastNotifiedAt);
    const diffMinutes = (now.getTime() - last.getTime()) / (1000 * 60);
    return diffMinutes >= frequency;
}
function isTimeMatch(storedTime, currentTime) {
    return storedTime === currentTime;
}
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
