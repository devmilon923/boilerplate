"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const multer_1 = __importDefault(require("../../multer/multer"));
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = express_1.default.Router();
router.post("/register", multer_1.default.single("image"), user_controller_1.UserController.registerUser);
router.post("/login", user_controller_1.UserController.loginUser);
router.post("/forget-password", user_controller_1.UserController.forgotPassword);
router.post("/reset-password", user_controller_1.UserController.resetPassword);
router.post("/verify-otp", user_controller_1.UserController.verifyOTP);
router.post("/resend-otp", user_controller_1.UserController.resendOTP);
router.post("/change-password", (0, roleGuard_1.guardRole)(["admin", "user"]), user_controller_1.UserController.changePassword);
router.patch("/profile-update", (0, roleGuard_1.guardRole)(["admin", "user"]), multer_1.default.single("image"), user_controller_1.UserController.updateUser);
router.get("/my-profile", (0, roleGuard_1.guardRole)(["admin", "user"]), user_controller_1.UserController.getSelfInfo);
router.delete("/account-delete", (0, roleGuard_1.guardRole)(["admin", "user"]), user_controller_1.UserController.deleteUser);
exports.UserRoutes = router;
//# sourceMappingURL=user.route.js.map