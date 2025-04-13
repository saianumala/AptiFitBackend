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
exports.userAuthorization = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
function userAuthorization(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accessToken = req.cookies.accessToken;
            if (!accessToken) {
                throw new Error("please signin");
            }
            const verifiedToken = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            // console.log(verifiedToken);
            const user = yield prisma_1.default.user.findUnique({
                where: {
                    userId: verifiedToken.userId,
                },
                select: {
                    userId: true,
                    email: true,
                    timeZone: true,
                },
            });
            if (!user) {
                throw new Error("user not found");
            }
            req.user = {
                userId: user.userId,
                email: user.email,
                timeZone: user.timeZone,
            };
            console.log(req.user);
            next();
        }
        catch (error) {
            res.status(403).json({ message: error.message, error: error });
            return;
        }
    });
}
exports.userAuthorization = userAuthorization;
