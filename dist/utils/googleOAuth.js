"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scopes = exports.oauth2Client = void 0;
const googleapis_1 = require("googleapis");
exports.oauth2Client = new googleapis_1.google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${process.env.SERVER_URL}/auth/google/callback`,
});
exports.scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
];
