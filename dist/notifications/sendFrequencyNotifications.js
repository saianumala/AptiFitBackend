"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFrequencyNotifications = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const sendNotification_1 = require("./sendNotification");
const timeUtils_1 = require("../utils/timeUtils");
const personalisedAi_1 = require("../utils/personalisedAi");
function sendFrequencyNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield prisma_1.default.user.findMany({
            where: {
                userPreferences: {
                    isNot: null,
                },
            },
            select: {
                userId: true,
                lastNotifiedAt: true,
                subscription: true,
                userPreferences: true,
                timeZone: true,
                bodyMetrics: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
                ConsumedMeals: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 2,
                },
            },
        });
        for (const user of users) {
            const { notificationFrequency } = user.userPreferences;
            if (notificationFrequency &&
                user.subscription &&
                (0, timeUtils_1.isTimeToNotify)(notificationFrequency, user.lastNotifiedAt)) {
                const data = yield (0, personalisedAi_1.personalisedAi)({
                    updatedUser: {
                        bodyMetrics: user.bodyMetrics[0],
                        userPreferences: user.userPreferences,
                        ConsumedMeals: user.ConsumedMeals,
                    },
                    category: "notification",
                });
                console.log(data);
                const payload = {
                    title: data.title,
                    body: data.body,
                };
                try {
                    yield (0, sendNotification_1.sendNotifications)({
                        subscription: user.subscription,
                        payload: payload,
                    });
                    yield prisma_1.default.user.update({
                        where: { userId: user.userId },
                        data: { lastNotifiedAt: new Date() },
                    });
                }
                catch (error) {
                    console.error("Failed to send frequency-based notification:", error);
                }
            }
        }
    });
}
exports.sendFrequencyNotifications = sendFrequencyNotifications;
