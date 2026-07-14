import { Job, Worker } from "bullmq";
import { sendNotification } from "../../utils/notifications";
import { prisma } from "../../utils/prisma";
import { notificationType } from "../../generated/prisma/enums";
import { sendOTP } from "../../utils/resend";
import redisDatabase from "../../utils/redisConnection";

const W_SendLikeNotification = async (
  job: Job<
    {
      sourceId: number;
      likeType: "post" | "replie" | "comment";
      sender: {
        name: string;
        id: number;
      };
    },
    any,
    string
  >,
) => {
  let title =
    job.data.likeType === "post"
      ? "Like on your post"
      : job.data.likeType === "comment"
        ? "Like on your comment"
        : "Like on your reply";
  let receiverId = null;
  try {
    if (job.data.likeType === "post" || job.data.likeType === "comment") {
      let findAuthor = await prisma.post.findUnique({
        where: { id: job.data.sourceId },
        select: {
          authorId: true,
        },
      });
      receiverId = findAuthor?.authorId;
    } else if (job.data.likeType === "replie") {
      let findComment = await prisma.comment.findUnique({
        where: { id: job.data.sourceId },
        select: { id: true },
      });
      let findAuthor = await prisma.post.findUnique({
        where: { id: findComment?.id },
        select: {
          authorId: true,
        },
      });
      receiverId = findAuthor?.authorId;
    }
  } catch (error) {
    throw error;
  }

  if (receiverId) {
    const result = await prisma.notificationSetting.findUnique({
      where: { userId: receiverId },
    });
    if (!result) return;
    type ResultKey =
      | "LIKE_ON_POST"
      | "LIKE_ON_COMMENT"
      | "COMMENT_ON_POST"
      | "isFollow";
    const type = `LIKE_ON_${job.data.likeType.toUpperCase()}` as ResultKey;
    if (result[type] === true) {
      await sendNotification({
        title,
        notiType:
          `LIKE_ON_${job.data.likeType.toUpperCase()}` as notificationType,
        senderId: job.data.sender.id,
        receiverId,
      });
    }
  }
};
const W_SendOTP = async (
  job: Job<{ to: string; subject: string; otp: number }, any, string>,
) => {
  try {
    console.log("Email send confrim from before notification queue");
    await sendOTP(job.data);
    console.log("Email send confrim from after notification queue");
  } catch (error) {
    throw error;
  }
};

const W_SendCommentNotification = async (
  job: Job<
    {
      sourceId: number;
      commentType: "post" | "replie";
      sender: {
        name: string;
        id: number;
      };
    },
    any,
    string
  >,
) => {
  let title =
    job.data.commentType === "post"
      ? "Comment on your post"
      : "Comment on your reply";
  let receiverId = null;

  try {
    if (job.data.commentType === "post") {
      let findAuthor = await prisma.post.findUnique({
        where: { id: job.data.sourceId },
        select: {
          authorId: true,
        },
      });
      receiverId = findAuthor?.authorId;
    } else if (job.data.commentType === "replie") {
      let findComment = await prisma.comment.findUnique({
        where: { id: job.data.sourceId },
        select: { id: true },
      });
      let findAuthor = await prisma.post.findUnique({
        where: { id: findComment?.id },
        select: {
          authorId: true,
        },
      });
      receiverId = findAuthor?.authorId;
    }
  } catch (error) {
    throw error;
  }

  if (receiverId) {
    const result = await prisma.notificationSetting.findUnique({
      where: { userId: receiverId },
    });
    if (!result) return;
    type ResultKey =
      | "LIKE_ON_POST"
      | "LIKE_ON_COMMENT"
      | "COMMENT_ON_POST"
      | "isFollow";
    const type =
      `COMMENT_ON_${job.data.commentType.toUpperCase()}` as ResultKey;
    if (result[type] === true) {
      await sendNotification({
        title,
        notiType:
          `COMMENT_ON_${job.data.commentType.toUpperCase()}` as notificationType,
        senderId: job.data.sender.id,
        receiverId,
      });
    }
  }
};
const W_CreateNotificationSetting = async (job: Job<any, any, any>) => {
  try {
    const result = await prisma.notificationSetting.upsert({
      where: { id: job.data },
      create: {
        user: { connect: { id: job.data } },
      },
      update: {
        user: { connect: { id: job.data } },
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

new Worker("handleSendLikeNotification", W_SendLikeNotification, {
  connection: redisDatabase,
});
new Worker("handleSendCommentNotification", W_SendCommentNotification, {
  connection: redisDatabase,
});
new Worker("handleNotificationSetting", W_CreateNotificationSetting, {
  connection: redisDatabase,
});
new Worker("handleSendOtp", W_SendOTP, { connection: redisDatabase });
