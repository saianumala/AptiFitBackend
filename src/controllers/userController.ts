import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import jwt from "jsonwebtoken";

const userSchema = z.object({
  fullName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(20),
});

export const updateUserSchema = userSchema.partial();

export async function loginCheck(req: Request, res: Response) {
  try {
    console.log("is logged in being checked");
    const user = await prisma.user.findUnique({
      where: {
        userId: req.user?.userId,
      },
      select: {
        userId: true,
        email: true,
        fullName: true,
        firstLogin: true,
        userPreferences: true,
        bodyMetrics: { orderBy: { createdAt: "desc" }, take: 1 },

        WorkoutAdvice: {
          include: {
            workouts: {
              include: {
                Exercise: true,
              },
            },
          },
        },
        DietAdvice: true,
        WorkoutLog: true,
        MealPlan: {
          include: {
            meals: true,
          },
        },
        Notifications: true,
        SleepAdvice: true,
        HydrationAdvice: true,
        MotivationAdvice: true,
        ConsumedMeals: true,
        RecoveryActions: true,
      },
    });
    res.status(200).json({ user: user });
  } catch (error: any) {
    // console.log(error);
    res.status(error.code).json({ message: error.message, user: req.user });
  }
}

// signup user
export async function createUser(req: Request, res: Response) {
  try {
    console.log("reaching create user");
    const { timeZone } = req.body;
    const result = userSchema.parse(req.body);
    console.log(result, timeZone);
    if (!result) {
      res
        .status(400)
        .json({ message: "all fields are required", error: result });
      return;
    }
    const { fullName, email, password } = result;
    const passwordHash = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        fullName,
        timeZone: timeZone,
      },
      select: {
        email: true,
        fullName: true,
      },
    });
    if (!newUser) {
      res.status(400).json({ error: "Failed to create user" });
      return;
    }
    res.status(201).json(newUser);
    return;
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const result = updateUserSchema.parse(req.body);

    if (!result) {
      res
        .status(400)
        .json({ message: "all fields are required", error: result });
      return;
    }

    const { fullName, email, password } = result;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      res.status(400).json({ error: "User does not exist" });
      return;
    }
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        email: email && email,
        password: password && (await bcrypt.hash(password, 10)),
        fullName: fullName && fullName,
      },
    });
    if (!updatedUser) {
      res.status(400).json({ error: "Failed to update user" });
      return;
    }
    res.status(200).json({ message: "success", updatedUserData: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      res.status(400).json({ error: "User does not exist" });
      return;
    }
    const deletedUser = await prisma.user.delete({
      where: {
        email,
      },
    });
    if (!deletedUser) {
      res.status(400).json({ error: "Failed to delete user" });
      return;
    }
    res.status(200).json({ message: "success", deletedUserData: deletedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
    return;
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        fullName: true,
        firstLogin: true,
        userPreferences: true,
        bodyMetrics: true,
        WorkoutAdvice: true,
        DietAdvice: true,
        WorkoutLog: true,
        ConsumedMeals: true,
        MealPlan: true,
        Notifications: true,
        RecoveryActions: true,
        SleepAdvice: true,
        HydrationAdvice: true,
        MotivationAdvice: true,
      },
    });
    if (!existingUser) {
      res.status(400).json({ error: "User does not exist" });
      return;
    }
    res.status(200).json({ message: "success", userData: existingUser });
    return;
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
    return;
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    console.log(email, password);

    if ([email, password].some((value) => value === "")) {
      throw new Error("all fields are required");
    }
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log(user);

    if (!user) {
      throw new Error("no user exists with this email: " + email);
    }
    const isPasswordCorrect = await bcrypt.compare(password, user?.password!);
    if (!isPasswordCorrect) {
      throw new Error("Incorrect Password");
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: Date.now() + 86400000 }
    );

    res
      .status(200)
      .cookie("accessToken", token, {
        sameSite: "none",
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
      })
      .json({
        message: "you are logged in",
        data: {
          email: user.email,
          firstSignin: user.firstLogin,
        },
      });
    return;
  } catch (error: any) {
    console.log("login failed");
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    } else {
      res.status(500).json({ message: error.message });
      return;
    }
  }
}

export async function logout(req: Request, res: Response) {
  res
    .status(200)
    .clearCookie("accessToken")
    .json({ message: "loggedOut successfully" });
}
