import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import apiRouter from "./routes/index";
import cookieParser from "cookie-parser";
// import heapdump from "heapdump";
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
// process.on("SIGUSR2", () => {
//   const snapshotName = `./heapdump-${Date.now()}.heapsnapshot`;
//   heapdump.writeSnapshot(snapshotName, (err, filename) => {
//     if (err) {
//       console.error("Error writing heap snapshot:", err);
//     } else {
//       console.log(`Heap snapshot written to ${filename}`);
//     }
//   });
// });
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("/welcom to aptifit");
});
app.use("/api", apiRouter);
app.use("/auth", googleAuth);
console.log("Server is attempting to listen on port:", process.env.PORT);
setInterval(() => {
  const used = process.memoryUsage();
  console.log(used);
  console.log(
    new Date(),
    `RSS: ${Math.round(used.rss / 1024 / 1024)}MB`,
    `Heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB/${Math.round(
      used.heapTotal / 1024 / 1024
    )}MB`
  );
}, 5000);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
