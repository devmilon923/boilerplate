import express from "express";

import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  //verifyOTP,
  resendOTP,
  changePassword,
  updateUser,
  getSelfInfo,
  deleteUser,
  verifyOTP,
  adminloginUser,
  getAllUsers,
} from "./user.controller";
import upload from "../../multer/multer";
import { guardRole } from "../../middlewares/roleGuard";

const router = express.Router();

router.post("/register", upload.single("image"), registerUser);

router.post("/login", loginUser);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/change-password", changePassword);
router.patch("/profile-update", upload.single("image"), updateUser);

router.get("/my-profile", getSelfInfo);

router.delete(
  "/account-delete",
  guardRole(["admin", "user", "manager"]),
  deleteUser
);

//----------------------->Admin route <--------------------------------

router.post("/admin-login", adminloginUser);
router.get("/user-list", guardRole("admin"), getAllUsers);

export const UserRoutes = router;
