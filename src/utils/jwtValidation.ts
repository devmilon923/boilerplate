import jwt from "jsonwebtoken";
const privateToken = process.env.JWT_SECRET_KEY as string;
export type TJwtUser = {
  id: number;
  name: string;
  email: string;
  isVerifyed: boolean;
  role: "user" | "admin";
};
export const verificationToken = (
  userId: string,
  type: "accountVerification" | "forgetPassword",
) => {
  return jwt.sign({ user: userId, type }, privateToken, {
    expiresIn: parseInt(process.env.rfExpire as string),
  });
};

export const loginToken = (payload: TJwtUser) => {
  return jwt.sign(payload, privateToken, {
    expiresIn: parseInt(process.env.acExpire as string),
  });
};
export const refreshtoken = (payload: TJwtUser) => {
  return jwt.sign(payload, privateToken, {
    expiresIn: parseInt(process.env.rfExpire as string),
  });
};
export const decodeToken = (token: string) => {
  return jwt.verify(token, privateToken);
};
