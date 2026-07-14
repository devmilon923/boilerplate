import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import "./utils/redisConnection";
import "./queue/workers/postWorker";
import "./strategy/jwt-strategy";
import { requestLogger } from "./middleware/requestLog";
import mainrouter from "./modules/routes";
import globalErrorHandler from "./middleware/errorHandler";
import passport from "passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import transport from "./utils/nodemailler";
const app: Express = express();
const PORT = process.env.ServerPort || 3000;
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://192.168.31.157:3000", process.env.ClientURl as string],
    credentials: true,
  }),
);
app.use(express.json());
app.use(passport.initialize());
app.use(requestLogger);
app.get("/", async (req: Request, res: Response) => {
  try {
    // Run the verification check
    await transport.verify();
    console.log("✅ SMTP Server connection successful! Ready to send emails.");
  } catch (error: any) {
    console.error("❌ SMTP Server connection failed:");
    console.error(error.message);
  }
  res.json({ message: "Hello from Express with TypeScript!" });
});
app.use(mainrouter);
app.use(globalErrorHandler);

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
