// test-mail.js - simple script to verify email sending
import { transporter } from "./backend/config/mail.js";
import dotenv from "dotenv";

dotenv.config();

const sendTestEmail = async () => {
  try {
    await transporter.verify();
    console.log("Transporter verified successfully");
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // send to self for testing
      subject: "Test Email from Project1",
      text: "This is a test email to verify nodemailer configuration.",
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending test email:", err);
  }
};

sendTestEmail();
