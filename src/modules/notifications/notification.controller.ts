import httpStatus from "http-status";

import jwt from "jsonwebtoken";

import { NextFunction, Request, Response } from "express";

import { findUserById } from "../user/user.utils";
import { NotificationModel } from "./notification.model";
import catchAsync from "../../utils/catchAsync";
import sendError from "../../utils/sendError";
import sendResponse from "../../utils/sendResponse";
import { verifyToken } from "../../utils/JwtToken";
import ApiError from "../../errors/ApiError";
import { sendPushNotificationToMultiple } from "./pushNotification/pushNotification.controller";
import paginationBuilder from "../../utils/paginationBuilder";

// --- Role-based notification config ---
const roleNotificationConfig = {
  admin: {
    queryKey: "adminId",
    selectFields: "adminMsg isAdminRead createdAt updatedAt",
    readField: "isAdminRead",
    msgField: "adminMsg",
  },
  carer: {
    queryKey: "carerId",
    selectFields: "carerMsg isCarerRead createdAt updatedAt",
    readField: "isCarerRead",
    msgField: "carerMsg",
  },
  nurse: {
    queryKey: "nurseId",
    selectFields: "nurseMsg isNurseRead createdAt updatedAt",
    readField: "isNurseRead",
    msgField: "nurseMsg",
  },
  cleaner: {
    queryKey: "cleanerId",
    selectFields: "cleanerMsg isCleanerRead createdAt updatedAt",
    readField: "isCleanerRead",
    msgField: "cleanerMsg",
  },
} as const;

export const getMyNotification = catchAsync(
  async (req: Request, res: Response) => {
    // Use req.auth for id/role, and fetch user from DB for full IUser
    const auth = (req as any).auth;
    if (!auth) throw new ApiError(401, "Unauthorized");
    const user = await findUserById(auth.id);
    if (!user) throw new ApiError(404, "User not found.");

    // Role config
    const config =
      roleNotificationConfig[user.role as keyof typeof roleNotificationConfig];
    if (!config) {
      return sendError(res, {
        statusCode: httpStatus.BAD_REQUEST,
        message: "Invalid user role.",
      });
    }
    const query = { [config.queryKey]: user._id };
    const selectFields = config.selectFields;
    const readField = config.readField;
    const msgField = config.msgField;

    // Fetch notifications
    const notifications = await NotificationModel.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .exec();
    const totalNotifications =
      await NotificationModel.countDocuments(query).exec();
    // Use paginationBuilder for pagination info
    const pagination = paginationBuilder({
      totalData: totalNotifications,
      currentPage: 1,
      limit: notifications.length,
    });
    const formattedNotifications = notifications.map((notification) => ({
      _id: notification._id,
      isReadable: notification[readField] as boolean,
      msg: notification[msgField] as string,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    }));
    if (formattedNotifications.length === 0) {
      return sendResponse(res, {
        statusCode: httpStatus.NO_CONTENT,
        success: true,
        message: "You have no notifications.",
        data: { notifications: [] },
      });
    }
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Here are your notifications.",
      data: {
        notifications: formattedNotifications,
        pagination: {
          ...pagination,
        },
      },
    });
    // Mark notifications as read
    await NotificationModel.updateMany(
      { ...query, [readField]: false },
      { $set: { [readField]: true } }
    );
  }
);

export const getUnreadBadgeCount = catchAsync(
  async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    if (!auth) throw new ApiError(401, "Unauthorized");
    const user = await findUserById(auth.id);
    if (!user) throw new ApiError(404, "User not found");

    const config =
      roleNotificationConfig[user.role as keyof typeof roleNotificationConfig];
    if (!config) {
      return sendError(res, {
        statusCode: httpStatus.BAD_REQUEST,
        message: "Invalid user role.",
      });
    }
    const unreadCount = await NotificationModel.countDocuments({
      [config.queryKey]: user._id,
      [config.readField]: false,
    }).exec();
    const rawNotifications = await NotificationModel.find({
      [config.queryKey]: user._id,
      [config.msgField]: { $exists: true },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select(`${config.msgField} createdAt`)
      .exec();
    const latestNotifications = rawNotifications.map((notification) => ({
      msg: notification[config.msgField] || "",
      createdAt: notification.createdAt,
    }));
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Unread badge count and latest notifications retrieved successfully.",
      data: {
        unreadCount,
        latestNotifications,
      },
    });
  }
);

export const adminSendPushNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fcmTokens, title, body } = req.body;
    if (!fcmTokens || !title || !body) {
      return res.status(400).json({
        message: "Missing required fields: fcmTokens, title, and body.",
      });
    }

    // Ensure fcmTokens is an array of strings
    let tokens: string[] = [];
    if (typeof fcmTokens === "string") {
      tokens = [fcmTokens];
    } else if (Array.isArray(fcmTokens)) {
      tokens = fcmTokens;
    } else {
      return res.status(400).json({
        message: "fcmTokens must be a string or an array of strings.",
      });
    }

    // Use the multicast helper to send notifications to all provided tokens
    const response = await sendPushNotificationToMultiple(tokens, {
      title,
      body,
    });
    return res
      .status(200)
      .json({ message: "Push notifications sent successfully.", response });
  } catch (error) {
    next(error);
  }
};
