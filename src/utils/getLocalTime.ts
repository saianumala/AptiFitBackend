import { DateTime } from "luxon";

export function getUserLocalDate({
  timezone,
  usersDefaultZone,
}: {
  timezone: string;
  usersDefaultZone: string;
}): string {
  const usersTimeZone = timezone || usersDefaultZone || "UTC";
  const userNow = DateTime.now().setZone(usersTimeZone);
  console.log(userNow.toISO());
  console.log(userNow.toISODate());
  return userNow.startOf("day").toISO() || "oops"; // returns "2025-04-10" or an empty string if null
}
