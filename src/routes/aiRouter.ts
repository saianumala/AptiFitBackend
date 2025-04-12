import { Request, Response, Router } from "express";
import { userAuthorization } from "../middleware/userAuth";

const router = Router();

// router.post(
//   "/generate-meal-plan",
//   userAuthorization,
//   (req: Request, res: Response) => {
//     const user;
//   }
// );
