// utils/emailTemplates.js

export const emailTemplates = {
  // 1. Welcome email
  welcome: (userName) => ({
    subject: "Welcome to Project1 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to Project1, ${userName || "User"}!</h2>
        <p>We’re excited to have you on board 🚀.</p>
        <p>Explore all the features and make the most out of Project1.</p>
        <p style="margin-top: 20px;">Cheers,<br/>The Project1 Team</p>
      </div>
    `,
  }),

  // 2. Verification OTP email
  verifyOtp: (otp) => ({
    subject: "Verify Your Email - Project1",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4F46E5;">Email Verification</h2>
        <p>Use the following One Time Password (OTP) to verify your account:</p>
        <h1 style="color: #111827; letter-spacing: 4px;">${otp}</h1>
        <p>This OTP is valid for <strong>15 minutes</strong>. Do not share it with anyone.</p>
        <p style="margin-top: 20px;">Thank you for joining Project1 🎉</p>
      </div>
    `,
  }),

  // 3. Reset password OTP email
  resetPasswordOtp: (otp) => ({
    subject: "Password Reset Request - Project1",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #DC2626;">Password Reset Requested</h2>
        <p>We received a request to reset your Project1 account password.</p>
        <p>Use the following OTP to reset your password:</p>
        <h1 style="color: #111827; letter-spacing: 4px;">${otp}</h1>
        <p>This OTP will expire in <strong>15 minutes</strong>.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p style="margin-top: 20px;">Stay secure,<br/>The Project1 Team</p>
      </div>
    `,
  }),
};
