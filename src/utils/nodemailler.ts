import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT as string),
  secure: true,
  auth: {
    user: process.env.Nodemailer_GMAIL as string,
    pass: process.env.Nodemailer_GMAIL_PASSWORD as string,
  },
});
console.log({
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT as string),
  auth: {
    user: process.env.Nodemailer_GMAIL as string,
    pass: process.env.Nodemailer_GMAIL_PASSWORD as string,
  },
});

export const sendOTP = async ({
  to,
  subject,
  otp,
}: {
  to: string;
  subject: string;
  otp: number;
}) => {
  await transport.sendMail({
    from: process.env.Nodemailer_GMAIL as string,
    to,
    subject,
    html: `
        <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #333;">${subject}</h2>
      <p>Please use the following OTP to verify your account:</p>
      <p style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">${otp}</p>
      <p>This OTP will expire in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>${process.env.APP_NAME || "Your App"}</p>
    </div>
    `,
  });
};

export default transport;
