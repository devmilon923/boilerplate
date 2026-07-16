import { Queue } from "bullmq";
import redisDatabase from "../../utils/redisConnection";

const handleSendOtp = new Queue("handleSendOtp", {
  connection: redisDatabase,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
const handleSendCommentNotification = new Queue(
  "handleSendCommentNotification",
  {
    connection: redisDatabase,
    defaultJobOptions: {
      removeOnComplete: true,
    },
  },
);
const handleSendLikeNotification = new Queue("handleSendLikeNotification", {
  connection: redisDatabase,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
const handleSendVerificationNotification = new Queue(
  "handleSendVerificationNotification",
  {
    connection: redisDatabase,
    defaultJobOptions: {
      removeOnComplete: true,
    },
  },
);
const handleNotificationSetting = new Queue("handleNotificationSetting", {
  connection: redisDatabase,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
async function createSetting(userId: number) {
  try {
    await handleNotificationSetting.add("createSetting", userId);
    console.log("Notification setting added on queue");
  } catch (error) {
    throw error;
  }
}
async function sendOTP(payload: { to: string; subject: string; otp: number }) {
  try {
    await handleSendOtp.add("senOTP", payload);
  } catch (error) {
    throw error;
  }
}
async function like(params: {
  sourceId: number;
  likeType: "post" | "replie" | "comment";
  sender: {
    name: string;
    id: number;
  };
}) {
  try {
    console.log("notification like producers running");
    await handleSendLikeNotification.add("sendLikeNotification", params);
    console.log("Notification added on queue");
  } catch (error) {
    throw error;
  }
}
async function comment(params: {
  sourceId: number;
  commentType: "post" | "replie";
  sender: {
    name: string;
    id: number;
  };
}) {
  try {
    console.log("notification comment producers running");
    await handleSendCommentNotification.add("sendCommentNotification", params);
    console.log("Notification added on queue");
  } catch (error) {
    throw error;
  }
}
async function verification(params: { userId: number }) {
  try {
    console.log("notification verification producer running");
    await handleSendVerificationNotification.add(
      "sendVerificationNotification",
      params,
    );
    console.log("Verification notification added on queue");
  } catch (error) {
    throw error;
  }
}

export const NotificationQueue = {
  like,
  comment,
  createSetting,
  sendOTP,
  verification,
};
