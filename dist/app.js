"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const index_1 = __importDefault(require("./routes/index"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import heapdump from "heapdump";
require("dotenv/config");
require("./notifications/notificationJobs");
const googleAuthRouter_1 = __importDefault(require("./routes/googleAuthRouter"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
};
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.get("/", (req, res) => {
    res.status(200).send("/welcom to aptifit");
});
app.use("/api", index_1.default);
app.use("/auth", googleAuthRouter_1.default);
console.log("Server is attempting to listen on port:", process.env.PORT);
setInterval(() => {
    const used = process.memoryUsage();
    console.log(used);
    console.log(new Date(), `RSS: ${Math.round(used.rss / 1024 / 1024)}MB`, `Heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB/${Math.round(used.heapTotal / 1024 / 1024)}MB`);
}, 5000);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
