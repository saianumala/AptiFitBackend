export function isTimeToNotify(
  frequency: number,
  lastNotifiedAt: Date | null
): boolean {
  const now = new Date();

  if (!lastNotifiedAt) return true;

  const last = new Date(lastNotifiedAt);
  const diffMinutes = (now.getTime() - last.getTime()) / (1000 * 60);

  return diffMinutes >= frequency;
}

export function isTimeMatch(storedTime: string, currentTime: string): boolean {
  return storedTime === currentTime;
}

export function isMissed(
  storedTime: string,
  now: Date,
  logStatus: string
): boolean {
  if (logStatus === "completed") return false;

  const [hour, minute] = storedTime.split(":").map(Number);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hour);
  scheduledTime.setMinutes(minute);
  scheduledTime.setSeconds(0);

  const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
  return diffMinutes > 30 && diffMinutes < 60;
}
