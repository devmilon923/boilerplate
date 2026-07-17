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

const app: Express = express();
const PORT = process.env.ServerPort || 3000;
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://storiboard.vercel.app", process.env.ClientURl as string],
    credentials: true,
  }),
);
app.use(express.json());
app.use(passport.initialize());
app.use(requestLogger);
// verifyEmailServer();
app.get("/", async (req: Request, res: Response) => {

  res.json({ message: "Hello from Express with TypeScript!" });
});
app.use(mainrouter);
app.use(globalErrorHandler);

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
