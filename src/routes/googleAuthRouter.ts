import { Router } from "express";
import jwt from "jsonwebtoken";
import { oauth2Client, scopes } from "../utils/googleOAuth";
import { google } from "googleapis";
import prisma from "../prisma";
const router = Router();

// Initiate Google OAuth
router.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  console.log(url);
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code as string;
  console.log("request object inside callback route");
  if (!code) {
    res.status(400).json({ error: "Missing code" });
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    const { email, name } = googleUser;

    if (!email) {
      res.status(400).json({ error: "No email from Google" });
      return;
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: name ?? "Unknown",
      },
    });

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .redirect(process.env.CORS_ORIGIN!);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OAuth failed" });
  }
});

export default router;
