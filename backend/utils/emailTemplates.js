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

  // 4. Student Admission email
  studentAdmission: (userName, password, loginLink) => ({
    subject: "Welcome to Project1 - Admission Successful 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Welcome, ${userName || "Student"}!</h2>
        <p>You have been successfully enrolled in your institute on Project1.</p>
        <p>Your account has been created by your administrator. Here are your login credentials:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 3px 6px; border-radius: 4px; font-size: 16px;">${password}</code></p>
        </div>

        <p>Please log in using your email address and the password provided above.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Project1</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">For security reasons, we strongly recommend changing your password after your first login.</p>
        <p style="margin-top: 30px;">Best wishes for your studies,<br/>The Project1 Team</p>
      </div>
    `,
  }),
};
