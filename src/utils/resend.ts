import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendOTP = async ({
  to,
  subject,
  otp,
}: {
  to: string;
  subject: string;
  otp: number;
}) => {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL as string,
      to: [to],
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
    console.log("Email send confrim from resend controller");
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export async function verifyEmailServer() {
  // Defensive check: Catch missing environment setup instantly
  if (!process.env.RESEND_API_KEY) {
    console.error(
      "❌ Email Service failed: RESEND_API_KEY environment variable is missing.",
    );
    return false;
  }

  try {
    // Make a lightweight, free API request to list domains.
    // This tests both your API Key validity and Render's outbound network connection.
    const { data, error } = await resend.domains.list();

    if (error) {
      throw new Error(error.message);
    }

    console.log(
      "✅ Email API Service authenticated successfully! Ready to send emails.",
    );
    return true;
  } catch (error: any) {
    console.error("❌ Email Service initialization failed:");
    console.error(
      `👉 Reason: ${error.message || "Network timeout or invalid API token"}`,
    );
    return false;
  }
}
