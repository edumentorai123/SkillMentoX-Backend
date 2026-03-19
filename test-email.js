import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

async function testEmail() {
  console.log("Testing email with user:", process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Connection SUCCESSFUL! Credentials are valid.");
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "Test Email from SkillMentoX-Backend",
      text: "If you see this, your email configuration is working!",
    });
    console.log("✅ Email SENT: " + info.messageId);
  } catch (error) {
    console.error("❌ Email FAILED:", error.message);
  }
}

testEmail();
