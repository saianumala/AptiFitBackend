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
exports.logout = exports.login = exports.getUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.loginCheck = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(20),
});
exports.updateUserSchema = userSchema.partial();
function loginCheck(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log("is logged in being checked");
            const user = yield prisma_1.default.user.findUnique({
                where: {
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
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
        }
        catch (error) {
            // console.log(error);
            res.status(error.code).json({ message: error.message, user: req.user });
        }
    });
}
exports.loginCheck = loginCheck;
// signup user
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const passwordHash = yield bcryptjs_1.default.hash(password, 10);
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                res.status(400).json({ error: "User already exists" });
                return;
            }
            const newUser = yield prisma_1.default.user.create({
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
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create user" });
            return;
        }
    });
}
exports.createUser = createUser;
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.updateUserSchema.parse(req.body);
            if (!result) {
                res
                    .status(400)
                    .json({ message: "all fields are required", error: result });
                return;
            }
            const { fullName, email, password } = result;
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { email },
            });
            if (!existingUser) {
                res.status(400).json({ error: "User does not exist" });
                return;
            }
            const updatedUser = yield prisma_1.default.user.update({
                where: { email },
                data: {
                    email: email && email,
                    password: password && (yield bcryptjs_1.default.hash(password, 10)),
                    fullName: fullName && fullName,
                },
            });
            if (!updatedUser) {
                res.status(400).json({ error: "Failed to update user" });
                return;
            }
            res.status(200).json({ message: "success", updatedUserData: updatedUser });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to update user" });
        }
    });
}
exports.updateUser = updateUser;
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            const existingUser = yield prisma_1.default.user.findUnique({
                where: {
                    email,
                },
            });
            if (!existingUser) {
                res.status(400).json({ error: "User does not exist" });
                return;
            }
            const deletedUser = yield prisma_1.default.user.delete({
                where: {
                    email,
                },
            });
            if (!deletedUser) {
                res.status(400).json({ error: "Failed to delete user" });
                return;
            }
            res.status(200).json({ message: "success", deletedUserData: deletedUser });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to delete user" });
            return;
        }
    });
}
exports.deleteUser = deleteUser;
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            const existingUser = yield prisma_1.default.user.findUnique({
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
        }
        catch (error) {
            res.status(500).json({ error: "Failed to get user" });
            return;
        }
    });
}
exports.getUser = getUser;
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            console.log(email, password);
            if ([email, password].some((value) => value === "")) {
                throw new Error("all fields are required");
            }
            const user = yield prisma_1.default.user.findUnique({
                where: {
                    email: email,
                },
            });
            console.log(user);
            if (!user) {
                throw new Error("no user exists with this email: " + email);
            }
            const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
            if (!isPasswordCorrect) {
                throw new Error("Incorrect Password");
            }
            const token = jsonwebtoken_1.default.sign({
                userId: user.userId,
                email: user.email,
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: Date.now() + 86400000 });
            res
                .status(200)
                .cookie("accessToken", token, {
                sameSite: "none",
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            })
                .json({
                message: "you are logged in",
                data: {
                    email: user.email,
                    firstSignin: user.firstLogin,
                },
            });
            return;
        }
        catch (error) {
            console.log("login failed");
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
                return;
            }
            else {
                res.status(500).json({ message: error.message });
                return;
            }
        }
    });
}
exports.login = login;
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res
            .status(200)
            .clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
            .json({ message: "loggedOut successfully" });
    });
}
exports.logout = logout;
