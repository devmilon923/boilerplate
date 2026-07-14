import { Job, Worker } from "bullmq";
import { prisma } from "../../utils/prisma";
import { TCommentState, TLikeState } from "../../modules/post/post.controller";
import redisDatabase from "../../utils/redisConnection";
let basedFormula = {
  likes: 1,
  comments: 2,
  replie: 3,
};
const W_LikeHandler = async (job: Job<any, any, string>) => {
  console.log("W_likeHandler get a job", job.data);
  const data = job.data as TLikeState;
  try {
    if (data.isLiked) {
      await prisma.post.update({
        where: {
          id: data.postId as number,
        },
        data: {
          trendScore: {
            increment: basedFormula.likes,
          },
        },
      });
    } else {
      await prisma.post.update({
        where: {
          id: data.postId as number,
        },
        data: {
          trendScore: {
            decrement: basedFormula.likes,
          },
        },
      });
    }
  } catch (error) {
    throw error;
  }
};
const W_CommentHandler = async (job: Job<any, any, string>) => {
  console.log("W_CommentHandler get a job", job.data);
  const data = job.data as TCommentState;
  try {
    if (data.isComment) {
      if (data.commentType === "post") {
        await prisma.post.update({
          where: {
            id: data.sourceId as number,
          },
          data: {
            trendScore: {
              increment: basedFormula.comments,
            },
          },
        });
      } else if (data.commentType === "replie") {
        let findPostId = await prisma.comment.findUnique({
          where: {
            id: data.sourceId,
          },
          select: {
            id: true,
          },
        });
        await prisma.post.update({
          where: {
            id: findPostId?.id,
          },
          data: {
            trendScore: {
              increment: basedFormula.replie,
            },
          },
        });
      }
    } else {
      if (data.commentType === "post") {
        await prisma.post.update({
          where: {
            id: data.sourceId as number,
          },
          data: {
            trendScore: {
              decrement: basedFormula.comments,
            },
          },
        });
      } else if (data.commentType === "replie") {
        let findPostId = await prisma.comment.findUnique({
          where: {
            id: data.sourceId,
          },
          select: {
            id: true,
          },
        });
        await prisma.post.update({
          where: {
            id: findPostId?.id,
          },
          data: {
            trendScore: {
              decrement: basedFormula.replie,
            },
          },
        });
      }
    }
  } catch (error) {
    throw error;
  }
};
// Worker=======
new Worker("handleLike", W_LikeHandler, { connection: redisDatabase });
new Worker("handleComment", W_CommentHandler, { connection: redisDatabase });


