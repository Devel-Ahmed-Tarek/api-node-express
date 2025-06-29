import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.sendMail(
  {
    from: process.env.MAIL_FROM,
    to: "ahmed.tarek.devel@gamil.com",
    subject: "Test Email",
    text: "This is a test email.",
  },
  (err, info) => {
    if (err) {
      console.error("❌ Error:", err);
    } else {
      console.log("✅ Sent:", info.response);
    }
  }
);
