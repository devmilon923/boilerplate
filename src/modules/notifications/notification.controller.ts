import { Request, Response } from "express";
import { handleAsync } from "../../utils/handleAsync";
import { prisma } from "../../utils/prisma";
import { TJwtUser } from "../../utils/jwtValidation";
import sendResponse from "../../utils/response";
import httpStatus from "http-status";
const getAllNotifications = handleAsync(async (req: Request, res: Response) => {
  const pc = Number(req.query.pc as string) || null;
  const limit = Number(req.query.limit as string) || 10;
  const user = req.user as TJwtUser;

  const result = await prisma.notifications.findMany({
    take: limit,
    skip: pc ? 1 : 0,
    cursor: pc ? { id: pc } : undefined,
    where: { receiverId: user.id },
    include: {
      sender: {
        select: {
          id: true,
          image: true,
          name: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const cursor = result.length === limit ? result[result.length - 1].id : null;
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get all notifications successfully!",
    data: result,
    cursor: cursor,
  });
});
export const NotificationController = {
  getAllNotifications,
};
