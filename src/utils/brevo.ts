import axios from "axios";
import { config } from "dotenv";
config();
export async function sendOTP({
  to,
  subject,
  otp,
}: {
  to: string;
  subject: string;
  otp: number;
}) {
  console.log(`[Brevo] Attempting to send OTP to ${to}...`);
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.Nodemailer_GMAIL as string,
          name: (process.env.APP_NAME ||
            process.env.AppName ||
            "Storyboard") as string,
        },
        to: [{ email: to }],
        subject: "Verify your email",
        htmlContent: `
          <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #333;">${subject}</h2>
        <p>Please use the following OTP to verify your account:</p>
        <p style="font-size: 24px; font-weight: bold; color: #b5b574ff; margin: 20px 0;">${otp}</p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p>${(process.env.APP_NAME || process.env.AppName || "Storyboard") as string}</p>
      </div>
      `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY as string,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(
      "[Brevo] OTP sent successfully, response status:",
      response.status,
    );
  } catch (error: any) {
    console.error(
      "[Brevo] Failed to send OTP email:",
      error.response?.data || error.message,
    );
    throw error;
  }
}
