"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotificationToMultiple = exports.sendPushNotification = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const config_1 = require("../../../config");
const http_status_1 = __importDefault(require("http-status"));
// Read and parse the Firebase service account JSON file
const serviceAccountBuffer = (0, fs_1.readFileSync)(config_1.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8");
const serviceAccount = JSON.parse(serviceAccountBuffer);
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
const sendPushNotification = async (fcmToken, payload) => {
    if (!fcmToken?.trim()) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No fcmtoken founded.");
    }
    const message = {
        token: fcmToken,
        notification: {
            title: payload.title,
            body: payload.body,
        },
    };
    try {
        const response = await firebase_admin_1.default.messaging().send(message);
        console.log("Push notification sent successfully:", response);
        return response;
    }
    catch (error) {
        console.error("Error sending push notification:", error);
        throw new ApiError_1.default(500, "Error sending push notification");
    }
};
exports.sendPushNotification = sendPushNotification;
// Fallback helper for sending notifications to multiple tokens
const sendPushNotificationToMultiple = async (tokens, payload) => {
    try {
        // Filter out invalid tokens
        const validTokens = tokens.filter((token) => !!token);
        if (validTokens.length === 0) {
            console.log("No valid tokens to send notifications to");
            return { responses: [], successCount: 0, failureCount: 0 };
        }
        // Create multicast message
        const message = {
            tokens: validTokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
        };
        // Send batch using Firebase optimized method
        const batchResponse = await firebase_admin_1.default.messaging().sendEachForMulticast(message);
        console.log(`Notifications sent: ${batchResponse.successCount} successful, ${batchResponse.failureCount} failed`);
        // Optional: Log individual errors
        // batchResponse.responses.forEach((resp, idx) => {
        //   if (!resp.success) {
        //     console.error(`Failed to send to ${validTokens[idx]}:`, resp.error);
        //   }
        // });
        return batchResponse;
    }
    catch (error) {
        console.error("Error sending push notifications:", error);
        throw error;
    }
};
exports.sendPushNotificationToMultiple = sendPushNotificationToMultiple;
