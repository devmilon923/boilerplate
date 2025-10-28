"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.findUserByEmail = exports.saveOTP = exports.generateOTP = exports.hashPassword = exports.verifyPassword = exports.sendManagerRequest = exports.sendResetOTPEmail = exports.resendOTPEmail = exports.sendOTPEmail = exports.getStoredOTP = exports.sendOTPEmailVerification = exports.sendOTPEmailRegister = void 0;
const user_model_1 = require("./user.model");
const config_1 = require("../../config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const argon2_1 = __importDefault(require("argon2"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const sendOTPEmailRegister = (name, email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        secure: true,
        auth: {
            user: config_1.Nodemailer_GMAIL,
            pass: config_1.Nodemailer_GMAIL_PASSWORD,
        },
    });
    const emailContent = `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f9fc; padding: 30px 20px; border-radius: 10px;">
      <h1 style="text-align: center; color:#111111 font-family: 'Times New Roman', Times, serif; font-size: 32px; letter-spacing: 2px;">
       ${process.env.AppName}
      </h1>
      <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #111111; text-align: center; font-size: 24px; font-weight: bold;">Hello ${name}!</h2>
        <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">You are receiving this email because we received a registration request for your account.</p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #111111; color: white; border-radius: 8px; font-size: 24px; font-weight: bold;">
          <h3 style="margin: 0; color:#FFFFFF" >Your OTP is: <strong>${otp}</strong></h3>
        </div>
        
        <p style="text-align: center; color: #e10600; font-weight: bold; font-size: 14px; margin-top: 20px;">This OTP will expire in 3 minutes.</p>
        <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6; margin-top: 20px;">If you did not request this, no further action is required.</p>
        <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">Regards,<br>${process.env.AppName}</p>
      </div>
      
      <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">If you're having trouble copying the OTP, please try again.</p>
    </div>
    
      `;
    const mailOptions = {
        from: "nodemailerapptest@gmail.com",
        to: email,
        subject: "Registration OTP",
        html: emailContent,
    };
    try {
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Unexpected error:", error);
        throw new ApiError_1.default(500, "Unexpected error occurred during email sending.");
    }
});
exports.sendOTPEmailRegister = sendOTPEmailRegister;
const sendOTPEmailVerification = (name, email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        secure: true,
        auth: {
            user: config_1.Nodemailer_GMAIL,
            pass: config_1.Nodemailer_GMAIL_PASSWORD,
        },
    });
    const emailContent = `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f9fc; padding: 30px 20px; border-radius: 10px;">
      <h1 style="text-align: center; color:#111111; font-family: 'Times New Roman', Times, serif; font-size: 32px; letter-spacing: 2px;">
       ${process.env.AppName}
      </h1>
      <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #111111; text-align: center; font-size: 24px; font-weight: bold;">Hello ${name}!</h2>
        <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">Your account is not yet verified. Please use the OTP below to complete your verification.</p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #111111; color: white; border-radius: 8px; font-size: 24px; font-weight: bold;">
          <h3 style="margin: 0; color:#FFFFFF" >Your OTP is: <strong>${otp}</strong></h3>
        </div>
        
        <p style="text-align: center; color: #e10600; font-weight: bold; font-size: 14px; margin-top: 20px;">This OTP will expire in 3 minutes.</p>
        <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6; margin-top: 20px;">If you did not request this, please ignore this email.</p>
        <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">Regards,<br>${process.env.AppName}</p>
      </div>
      
      <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">If you're having trouble copying the OTP, please try again.</p>
    </div>
  `;
    const mailOptions = {
        from: "nodemailerapptest@gmail.com",
        to: email,
        subject: "Verify Your Account - OTP",
        html: emailContent,
    };
    try {
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Unexpected error:", error);
        throw new ApiError_1.default(500, "Unexpected error occurred during email sending.");
    }
});
exports.sendOTPEmailVerification = sendOTPEmailVerification;
const getStoredOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otpRecord = yield user_model_1.OTPModel.findOne({ email });
    return otpRecord ? otpRecord.otp : null;
});
exports.getStoredOTP = getStoredOTP;
const sendOTPEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        secure: true,
        auth: {
            user: config_1.Nodemailer_GMAIL,
            pass: config_1.Nodemailer_GMAIL_PASSWORD,
        },
    });
    const emailContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f9fc; padding: 30px 20px; border-radius: 10px;">
    <h1 style="text-align: center; color: #1a3d6d; font-family: 'Times New Roman', Times, serif; font-size: 32px; letter-spacing: 2px;">
      Shower<span style="color:#00c38a; font-size: 0.9em;">share</span>
    </h1>
    <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
      <h2 style="color:#111111; text-align: center; font-size: 24px; font-weight: bold;">Hello!</h2>
      <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">You are receiving this email because we received a registration request for your account.</p>
      
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color:#111111; color: white; border-radius: 8px; font-size: 24px; font-weight: bold;">
        <h3 style="margin: 0;">Your OTP is: <strong>${otp}</strong></h3>
      </div>
      
      <p style="text-align: center; color: #e10600; font-weight: bold; font-size: 14px; margin-top: 20px;">This OTP will expire in 3 minutes.</p>
      <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6; margin-top: 20px;">If you did not request this, no further action is required.</p>
      <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">Regards,<br>${process.env.AppName}</p>
    </div>
    
    <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">If you're having trouble copying the OTP, please try again.</p>
  </div>
  
  
    `;
    const mailOptions = {
        from: "nodemailerapptest@gmail.com",
        to: email,
        subject: "Registration OTP",
        html: emailContent,
    };
    try {
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Unexpected error:", error);
        throw new ApiError_1.default(500, "Unexpected error occurred during email sending.");
    }
});
exports.sendOTPEmail = sendOTPEmail;
const resendOTPEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: config_1.Nodemailer_GMAIL,
                pass: config_1.Nodemailer_GMAIL_PASSWORD,
            },
        });
        const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f9fc; padding: 30px 20px; border-radius: 10px;">
      <h1 style="text-align: center; color: #1a3d6d; font-family: 'Times New Roman', Times, serif; font-size: 32px; letter-spacing: 2px;">
       ${process.env.AppName}
      </h1>
      <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <h2 style="color:#111111; text-align: center; font-size: 24px; font-weight: bold;">Hello!</h2>
        <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">
          We noticed you requested another OTP for verification. Use the code below to complete your process.
        </p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color:#111111; color: white; border-radius: 8px; font-size: 24px; font-weight: bold;">
          <h3 style="margin: 0; color: #FFFFFF">Your New OTP is: <strong>${otp}</strong></h3>
        </div>
        
        <p style="text-align: center; color: #e10600; font-weight: bold; font-size: 14px; margin-top: 20px;">
          This OTP will expire in 3 minutes.
        </p>
        <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6; margin-top: 20px;">
          If you did not request this, please ignore this email.
        </p>
        <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">
          Regards,<br>${process.env.AppName}
        </p>
      </div>
      
      <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">
        If you're having trouble copying the OTP, please try again.
      </p>
    </div>
    `;
        const mailOptions = {
            from: "nodemailerapptest@gmail.com",
            to: email,
            subject: "Resend OTP ",
            html: emailContent,
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error(`Error sending OTP email to ${email}:`, error);
        throw new ApiError_1.default(500, "Unexpected error occurred during email sending.");
    }
});
exports.resendOTPEmail = resendOTPEmail;
const sendResetOTPEmail = (email, otp, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: config_1.Nodemailer_GMAIL,
                pass: config_1.Nodemailer_GMAIL_PASSWORD,
            },
        });
        const emailContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f9fc; padding: 30px 20px; border-radius: 10px;">
   <h1 style="text-align: center; color: #111111; font-family: 'Times New Roman', Times, serif; font-size: 32px; letter-spacing: 2px;">
    ${process.env.AppName}
  </h1>
  
  <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #111111; text-align: center; font-size: 24px; font-weight: bold;">Hello ${name}!</h2>
    <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">You are receiving this email because we received a password reset request for your account.</p>
    
    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #111111; color: white; border-radius: 8px; font-size: 24px; font-weight: bold;">
      <h3 style="margin: 0; color: #FFFFFF">Your OTP is: <strong>${otp}</strong></h3>
    </div>
    
    <p style="text-align: center; color: #e10600; font-weight: bold; font-size: 14px; margin-top: 20px;">This OTP will expire in 3 minutes.</p>
    <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6; margin-top: 20px;">If you did not request a password reset, no further action is required.</p>
    <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">Regards,<br></p>
  </div>
  
  <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">If you're having trouble copying the OTP, please try again.</p>
</div>


    `;
        const mailOptions = {
            from: "nodemailerapptest@gmail.com",
            to: email,
            subject: "Reset Password OTP",
            html: emailContent,
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error(`Error sending OTP email to ${email}:`, error);
        throw new ApiError_1.default(500, "Unexpected error occurred during email sending.");
    }
});
exports.sendResetOTPEmail = sendResetOTPEmail;
const sendManagerRequest = (emails, name, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: config_1.Nodemailer_GMAIL,
                pass: config_1.Nodemailer_GMAIL_PASSWORD,
            },
        });
        const emailContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f9fc; padding: 30px 20px; border-radius: 10px;">
  <h1 style="text-align: center; color: #111111; font-family: 'Times New Roman', Times, serif; font-size: 32px; letter-spacing: 2px;">
    ${process.env.AppName}
  </h1>
  
  <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #111111; text-align: center; font-size: 24px; font-weight: bold;">Hello Admin!</h2>
 <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">
      A new manager request has been submitted by <strong>${name}</strong> (<strong>${email}</strong>).
    </p>
  
    <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6; margin-top: 20px;">
      Please review the request and take the appropriate action.
    </p>
    <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">
      Regards,<br>${process.env.AppName}
    </p>
  </div>
  
  <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">
    This is an automated notification. Please do not reply directly to this email.
  </p>
</div>
`;
        const mailOptions = {
            from: "nodemailerapptest@gmail.com",
            to: emails,
            subject: "New Manager Request Notification",
            html: emailContent,
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error(`Error sending manager request email to ${emails}:`, error);
        throw new ApiError_1.default(500, "Unexpected error occurred during sending manager request email.");
    }
});
exports.sendManagerRequest = sendManagerRequest;
const verifyPassword = (inputPassword, storedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield argon2_1.default.verify(storedPassword, inputPassword);
    }
    catch (error) {
        throw new Error("Password verification failed");
    }
});
exports.verifyPassword = verifyPassword;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield argon2_1.default.hash(password);
    }
    catch (error) {
        throw new Error("Password hashing failed");
    }
});
exports.hashPassword = hashPassword;
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const saveOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.OTPModel.findOneAndUpdate({ email }, { otp, expiresAt: new Date(Date.now() + 3 * 60 * 1000) }, { upsert: true, new: true });
});
exports.saveOTP = saveOTP;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.UserModel.findOne({ email });
});
exports.findUserByEmail = findUserByEmail;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.UserModel.findById(id);
});
exports.findUserById = findUserById;
