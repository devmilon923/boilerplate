import { Job, Worker } from "bullmq";
import redisDatabase from "../../utils/redisConnection";

const feedWorker = new Worker(
  "feedPrepare",
  async (job: Job<any, any, string>) => {
    console.log(job.id, "Prossing job");
  },
  {
    connection: redisDatabase, // 1. Increase drain delay (value is in SECONDS)
    // Default is 5s (17k commands/day). 300s (5 mins) drops it to ~288 commands/day.
    drainDelay: 60,

    // 2. Increase stalled job check interval (value is in MILLISECONDS)
    // Default is 30000ms (30s). 300000ms drops the checks to every 5 minutes.
    stalledInterval: 300000,
  },
);
