"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = express_1.default.Router();
router.get("/", (0, roleGuard_1.guardRole)(["admin", "user"]), notification_controller_1.getMyNotification);
router.get("/badge-count", (0, roleGuard_1.guardRole)(["admin", "user"]), notification_controller_1.getUnreadBadgeCount);
router.post("/send-push", (0, roleGuard_1.guardRole)("admin"), notification_controller_1.adminSendPushNotification);
exports.NotificationRoutes = router;
//# sourceMappingURL=notification.route.js.map