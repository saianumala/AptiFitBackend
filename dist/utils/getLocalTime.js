"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserLocalDate = void 0;
const luxon_1 = require("luxon");
function getUserLocalDate({ timezone, usersDefaultZone, }) {
    const usersTimeZone = timezone || usersDefaultZone || "UTC";
    const userNow = luxon_1.DateTime.now().setZone(usersTimeZone);
    console.log(userNow.toISO());
    console.log(userNow.toISODate());
    return userNow.startOf("day").toISO() || "oops"; // returns "2025-04-10" or an empty string if null
}
exports.getUserLocalDate = getUserLocalDate;
