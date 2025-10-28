// import { createServer, Server as HttpServer } from "http";
// import { initSocketIO } from "./utils/socket";
// import mongoose from "mongoose";
// import app from "./app"; // Express app
// import { DATABASE_URL, PORT } from "./config";
// import seedSuperAdmin, { seedAbout, seedPrivacy, seedTerms } from "./DB"; // Seeding function

// let server: HttpServer;

// async function main() {
//   try {
//     const dbStartTime = Date.now();
//     // Connect to MongoDB with a timeout
//     await mongoose.connect(DATABASE_URL as string, {
//       connectTimeoutMS: 10000, // 10 seconds timeout
//     });
//     console.log(
//       `\r✅ Mongodb connected successfully in ${Date.now() - dbStartTime}ms`,
//     );

//     // Start HTTP server
//     server = createServer(app);
//     const serverStartTime = Date.now();
//     server.listen(PORT, () => {
//       console.log(
//         `🚀 Server is running on port ${PORT} and take ${Date.now() - serverStartTime}ms to start!`,
//       );
//     });

//     // Initialize Socket.IO
//     initSocketIO(server);
//     // Start seeding in parallel after the server has started
//     await Promise.all([
//       seedSuperAdmin(),
//       seedPrivacy(),
//       seedTerms(),
//       seedAbout(),
//     ]);
//   } catch (error) {
//     console.error("Error in main function:", error);
//     process.exit(1);
//   }
// }

// main().catch((error) => {
//   console.error("☠️ Unhandled error in main:", error);
//   process.exit(1);
// });

// // Gracefully handle unhandled rejections and uncaught exceptions
// process.on("unhandledRejection", (err) => {
//   console.error(" ☠️ Unhandled promise rejection detected:", err);
//   server.close(() => process.exit(1));
// });

// process.on("uncaughtException", (error) => {
//   console.error("☠️ Uncaught exception detected:", error);
//   server.close(() => process.exit(1));
// });

import express, { Request, Response } from "express";
import path from "path";

const __dirname = path.dirname(__filename);

const app = express();

// Home route - HTML

app.get("/about", function (req: Request, res: Response) {
  res.sendFile(path.join(__dirname, "..", "components", "about.htm"));
});

// Example API endpoint - JSON
app.get("/api-data", (req, res) => {
  res.json({
    message: "Here is some sample API data",
    items: ["apple", "banana", "cherry"],
  });
});

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
