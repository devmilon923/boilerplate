import mongoose, { Document } from "mongoose";
import { TRole } from "../../config/role";

export type IUser = {
  name: string;
  email: string;
  facebookLink?: string;
  instagramLink?: string;
  password: string | null;
  phone: string;
  image: {
    publicFileURL: string;
    path: string;
  };
  isVerified: boolean;
  role: TRole;
  isRequest?: "approve" | "deny" | "send";
  isDeleted: boolean;
  fcmToken?: string;
  oneSignalPlayerId?: string;
} & Document;

export type IOTP = {
  email: string;
  otp: string;
  expiresAt: Date;
} & Document;
