import { Queue, Worker } from "bullmq";
import redisDatabase from "../../utils/redisConnection";
import { TCommentState, TLikeState } from "../../modules/post/post.controller";
const handleLike = new Queue("handleLike", {
  connection: redisDatabase,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
const handleComment = new Queue("handleComment", {
  connection: redisDatabase,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
async function like(data: TLikeState) {
  try {
    await handleLike.add("like", data);
    console.log("Job added to handleLike queue");
  } catch (error) {
    throw error;
  }
}

async function comment(data: TCommentState) {
  try {
    await handleComment.add("comment", data);
    console.log("Job added to handleComment queue");
  } catch (error) {
    throw error;
  }
}

export const PostQueue = {
  like,
  comment,
};
