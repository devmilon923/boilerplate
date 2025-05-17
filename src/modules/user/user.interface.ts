import mongoose, { Document, ObjectId } from "mongoose";
import { TRole } from "../../config/role";
export const MoodEnum = ["Peaceful", "Grateful", "Hopeful", "Lonely", "Sad"];
export type IUser = {
  name: string;
  email: string;
  password: string;
  gender?: "male" | "female" | "other";
  ageRange?: string;
  address?: string;
  user_mood: "Peaceful" | "Grateful" | "Hopeful" | "Lonely" | "Sad";
  jurnals?: ObjectId[] | null;
  chat_history_with_ai?: ObjectId[] | null;
  profile_status?: Boolean;
  conections?: ObjectId[] | null;
  image: {
    publicFileURL: string;
    path: string;
  };
  isVerified: boolean;
  blockStatus: Date | null;
  role: TRole;
  isRequest?: "approve" | "deny" | "send";
  isDeleted: boolean;
  fcmToken?: string;
} & Document;

export type IOTP = {
  email: string;
  otp: string;
  expiresAt: Date;
} & Document;
