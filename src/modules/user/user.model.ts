import { registerUser } from "./user.controller";
import mongoose, { Schema } from "mongoose";
import { IUser, IOTP } from "./user.interface";
import { ERole } from "../../config/role";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, trim: true },
    phone: { type: String, trim: true },
    facebookLink: { type: String, trim: true },
    instagramLink: { type: String, trim: true },
    image: {
      type: {
        publicFileURL: { type: String, trim: true },
        path: { type: String, trim: true },
      },
      required: false,
      default: {
        publicFileURL: "",
        path: "",
      },
    },
    role: {
      type: String,
      enum: ERole,
      required: true,
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
    fcmToken: { type: String, trim: true }, //-------> push notification(firebase)
    oneSignalPlayerId: { type: String, trim: true }, //------------------->push notification(oneSignal)
    isRequest: {
      type: String,
      enum: ["approve", "deny", "send"],
      default: "send",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

UserSchema.index({ name: "text" });
UserSchema.index({ createdAt: 1 });
UserModel.schema.index({ role: 1 });

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, trim: true, index: true },
  otp: { type: String, required: true, trim: true },
  expiresAt: { type: Date, required: true, index: { expires: "1m" } },
});

export const OTPModel = mongoose.model<IOTP>("OTP", OTPSchema);
OTPSchema.index({ email: 1, expiresAt: 1 });
