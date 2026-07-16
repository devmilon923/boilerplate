import { prisma } from "./prisma";

export type NotificationType = {
  senderId: number;
  receiverId: number;
  title: string;
  ref?: string; // url of page
  notiType:
    | "LIKE_ON_POST"
    | "LIKE_ON_COMMENT"
    | "COMMENT_ON_POST"
    | "COMMENT_ON_REPLIE"
    | "FOLLOW"
    | "ACCOUNT_VERIFIED";
};

export const sendNotification = async (payload: NotificationType) => {
  try {
    //TODO
    // implement socket

    const result = await prisma.notifications.create({
      data: {
        sender: { connect: { id: payload.senderId } },
        receiver: { connect: { id: payload.receiverId } },
        title: payload.title,
        notiType: payload.notiType,
        ref: payload.ref,
      },
    });
    return result;
  } catch (error) {
    return false;
  }
};
