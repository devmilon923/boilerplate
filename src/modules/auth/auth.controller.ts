import { Request, Response } from "express";
import { handleAsync } from "../../utils/handleAsync";
import { prisma } from "../../utils/prisma";
import sendResponse from "../../utils/response";
import httpStatus from "http-status";
import ServerError from "../../utils/error";
import bcrypt from "bcrypt";
import redisDatabase from "../../utils/redisConnection";
import jwt from "jsonwebtoken";
import {
  decodeToken,
  loginToken,
  refreshtoken,
  TJwtUser,
  verificationToken,
} from "../../utils/jwtValidation";
import { generateOTP, verifyOTP } from "../../utils/otpValidation";
import { sendOTP } from "../../utils/nodemailer";
import { NotificationQueue } from "../../queue/producers/notifications";

const register = handleAsync(async (req: Request, res: Response) => {
  const { email, password, name, gender, profession, image } = req.body;
  const hashPassword = bcrypt.hashSync(password, 10);
  const isUserExist = await prisma.user.findFirst({
    where: {
      email,
      role: "User",
    },
  });
  if (isUserExist && isUserExist.isVerifyed) {
    throw new ServerError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      gender,
      image,
      profession,
      password: hashPassword as string,
    },
  });

  const time = await redisDatabase.ttl("otp" + user.id.toString());
  if (time && time !== -2) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Try again after" + time + "seconds",
    );
  }

  // Generate Secure OTP (Expire in 120 seconds)
  const secureOTP: any = generateOTP();

  await redisDatabase.setex("otp" + user.id.toString(), 120, secureOTP.hash);

  // Generate an validation otp
  const token = verificationToken(user.id.toString(), "accountVerification");
  res.cookie("verification_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "lax",
    maxAge: parseInt(process.env.rfExpire as string) * 1000,
  });
  //Send Otp
  NotificationQueue.sendOTP({
    to: user.email,
    subject: "Verify your account",
    otp: secureOTP.plainToken,
  });
  console.log("Email send confrim from before notification queue");
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Register successfully but you need to verify your account",
    data: { user },
  });
});

const localLogin = handleAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
    omit: {
      password: false,
    },
  });
  if (!user) {
    throw new ServerError(httpStatus.BAD_REQUEST, "Invalid login details");
  }
  const isValidPassword = bcrypt.compareSync(req.body.password, user.password);
  if (!isValidPassword) {
    throw new ServerError(httpStatus.BAD_REQUEST, "Invalid password");
  }
  const token = loginToken({ ...user, role: "user" });
  // generate refresh token
  const refreshToken = refreshtoken({ ...user, role: "user" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: parseInt(process.env.acExpire as string) * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: parseInt(process.env.rfExpire as string) * 1000,
  });
  NotificationQueue.createSetting(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successfully!",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerifyed: user.isVerifyed,
      role: "user",
      token,
      refreshToken,
    },
  });
  await redisDatabase.setex(
    `refresh_token:${user.id}`,
    60, // Seconds
    refreshToken,
  );
});

const verifyAccount = handleAsync(async (req: Request, res: Response) => {
  const verificationToken = req.cookies.verification_token;

  // console.log(verificationToken);
  if (!verificationToken) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Verification token is required",
    );
  }
  const payload: any = decodeToken(verificationToken);
  if (payload.type !== "accountVerification") {
    throw new ServerError(httpStatus.BAD_REQUEST, "Invalid action");
  }
  const redisSecureOtp = await redisDatabase.get(
    "otp" + payload.user.toString(),
  );
  if (!redisSecureOtp) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP. Please send again new otp",
    );
  }
  const userOtp = req.body.otp;

  const verifyOTPHash = verifyOTP(redisSecureOtp, userOtp);

  if (!verifyOTPHash) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP. Please send again new otp",
    );
  }
  const user = await prisma.user.update({
    where: {
      id: parseInt(payload.user),
    },
    data: {
      isVerifyed: true,
    },
  });
  res.clearCookie("verification_token");
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Account verifyed successfully!",
    data: user,
  });
  await redisDatabase.del("otp" + payload.user.toString());
});

const resendOTP = handleAsync(async (req: Request, res: Response) => {
  const verificationToken = req.cookies.verification_token;
  if (!verificationToken) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Authorization token is required",
    );
  }
  console.log("===================");
  const payload: any = decodeToken(verificationToken);
  if (
    payload.type !== "accountVerification" &&
    payload.type !== "forgetPassword"
  ) {
    throw new ServerError(httpStatus.BAD_REQUEST, "Invalid action");
  }
  const user: any = await prisma.user.findUnique({
    where: { id: Number(payload.user as string) },
    select: { id: true, email: true },
  });
  if (!user)
    throw new ServerError(httpStatus.NOT_FOUND, "invalid user account");
  const time = await redisDatabase.ttl("otp" + payload.user.toString());
  if (time && time !== -2) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Try again after" + " " + time + " " + "seconds",
    );
  }
  const secureOTP: any = generateOTP();
  await redisDatabase.setex(
    "otp" + payload.user.toString(),
    parseInt(process.env.veriExpire as string),
    secureOTP.hash,
  );
  res.cookie("verification_token", verificationToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: parseInt(process.env.rfExpire as string) * 1000,
  });
  await sendOTP({
    to: user.email,
    subject: "Verify your account",
    otp: secureOTP.plainToken,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "New OTP sended!",
    data: verificationToken,
  });
});
const forgetPassword = handleAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Please provide valid information",
    );
  }
  const token = verificationToken(user.id?.toString(), "forgetPassword");
  const secureOTP = generateOTP();
  await redisDatabase.setex("otp" + user.id.toString(), 120, secureOTP.hash);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Forget OTP sended!",
    data: token,
  });
});
const newPassword = handleAsync(async (req: Request, res: Response) => {
  const authHeader = req.get("Authorization")?.split(" ")[1];
  if (!authHeader) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Authorization token is required",
    );
  }
  const payload: any = decodeToken(authHeader);
  if (payload.type !== "forgetPassword") {
    throw new ServerError(httpStatus.BAD_REQUEST, "Invalid action");
  }
  const redisSecureOtp = await redisDatabase.get(
    "otp" + payload?.user?.toString(),
  );
  if (!redisSecureOtp) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP. Please send again new otp",
    );
  }
  const userOtp = req.body.otp;

  const verifyOTPHash = verifyOTP(redisSecureOtp, userOtp);

  if (!verifyOTPHash) {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP. Please send again new otp",
    );
  }
  const hashPassword = bcrypt.hashSync(req.body.password, 10);
  const user = await prisma.user.update({
    where: {
      id: parseInt(payload.user),
    },
    data: {
      password: hashPassword,
    },
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Password recovery successful",
    data: user,
  });
  await redisDatabase.del("otp" + payload.user.toString());
});

const renewToken = handleAsync(async (req: Request, res: Response) => {
  const cookieToken = req.cookies.refreshToken;
  const userDecode = jwt.verify(
    cookieToken,
    process.env.JWT_SECRET_KEY as string,
  ) as TJwtUser;
  const storedToken = await redisDatabase.get(`refresh_token:${userDecode.id}`);
  if (!storedToken || storedToken !== cookieToken) {
    throw new ServerError(
      httpStatus.UNAUTHORIZED,
      "Invalid refresh token or user",
    );
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userDecode.id,
    },
  });
  if (!user) {
    throw new ServerError(httpStatus.BAD_REQUEST, "User not found");
  }

  const token = loginToken({ ...user, role: "user" });
  // generate refresh token
  const refreshToken = refreshtoken({ ...user, role: "user" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: parseInt(process.env.acExpire as string) * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: parseInt(process.env.rfExpire as string) * 1000,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Token renew successful",
    data: { refreshToken, accessToken: token },
  });
  return await redisDatabase.setex(
    `refresh_token:${user.id}`,
    parseInt(process.env.rfExpire as string), // Seconds
    refreshToken,
  );
});

const logout = handleAsync(async (req: Request, res: Response) => {
  const cookieToken = req.cookies.refreshToken;
  const userDecode = jwt.verify(
    cookieToken,
    process.env.JWT_SECRET_KEY as string,
  ) as TJwtUser;
  await redisDatabase.del(`refresh_token:${userDecode.id}`);
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Logout successful",
    data: true,
  });
});
export const AuthController = {
  register,
  localLogin,
  verifyAccount,
  resendOTP,
  forgetPassword,
  newPassword,
  renewToken,
  logout,
};
