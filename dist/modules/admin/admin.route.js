"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const roleGuard_1 = require("../../middlewares/roleGuard");
const admin_controller_1 = require("./admin.controller");
const user_controller_1 = require("../user/user.controller");
const router = (0, express_1.Router)();
router
    .route("/change-user/status/:userId")
    .get((0, roleGuard_1.guardRole)("admin"), admin_controller_1.AdminController.changeUserStatus);
router.post("/admin-login", user_controller_1.UserController.adminloginUser);
router.get("/user-list", (0, roleGuard_1.guardRole)("admin"), user_controller_1.UserController.getAllUsers);
exports.AdminRoutes = router;
