import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../prisma";

export async function userAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new Error("please signin");
    }
    const verifiedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;
    // console.log(verifiedToken);
    const user = await prisma.user.findUnique({
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
  } catch (error: any) {
    res.status(403).json({ message: error.message, error: error });
    return;
  }
}
