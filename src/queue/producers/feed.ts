import { Queue } from "bullmq";
import redisDatabase from "../../utils/redisConnection";

const feedPrepare = new Queue("feedPrepare", { connection: redisDatabase });

async function prepareFeed(postId: number) {
  try {
    await feedPrepare.add("prepareFeed", {
      postId,
    });
    console.log("New job added");
  } catch (error) {
    throw error;
  }
}

export const FeedQueue = {
  prepareFeed,
};
