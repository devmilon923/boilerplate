import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { IUser } from "../modules/user/user.interface";

export const validateUserLockStatus = async (user: IUser) => {
  if (user?.blockStatus !== null) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Your account is temporarily blocked"
    );
  } else {
    return true;
  }
};
