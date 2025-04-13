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
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleOAuth_1 = require("../utils/googleOAuth");
const googleapis_1 = require("googleapis");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// Initiate Google OAuth
router.get("/google", (req, res) => {
    const url = googleOAuth_1.oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: googleOAuth_1.scopes,
        prompt: "consent",
    });
    console.log(url);
    res.redirect(url);
});
router.get("/google/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    console.log("request object inside callback route");
    if (!code) {
        res.status(400).json({ error: "Missing code" });
        return;
    }
    try {
        const { tokens } = yield googleOAuth_1.oauth2Client.getToken(code);
        googleOAuth_1.oauth2Client.setCredentials(tokens);
        // Get user info from Google
        const oauth2 = googleapis_1.google.oauth2({ version: "v2", auth: googleOAuth_1.oauth2Client });
        const { data: googleUser } = yield oauth2.userinfo.get();
        const { email, name } = googleUser;
        if (!email) {
            res.status(400).json({ error: "No email from Google" });
            return;
        }
        const user = yield prisma_1.default.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                fullName: name !== null && name !== void 0 ? name : "Unknown",
            },
        });
        // Create JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.userId,
            email: user.email,
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
        res
            .cookie("accessToken", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        })
            .redirect(process.env.CORS_ORIGIN);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "OAuth failed" });
    }
}));
exports.default = router;
