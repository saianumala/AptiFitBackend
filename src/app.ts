import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRouter from "./routes/index";
import cookieParser from "cookie-parser";

import "dotenv/config";
import "./notifications/notificationJobs";
import googleAuth from "./routes/googleAuthRouter";

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).send("/welcom to aptifit");
});
app.use("/api", apiRouter);
app.use("/auth", googleAuth);
console.log("Server is attempting to listen on port:", process.env.PORT);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
