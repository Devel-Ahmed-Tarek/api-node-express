import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { IEmailSender } from "../interfaces/IEmailSender";
import { ITemplateRenderer } from "../interfaces/ITemplateRenderer";
import { error, info } from "console";

dotenv.config();

export class NodemailerEmailSender implements IEmailSender {
  private transporter;

  constructor(private renderer: ITemplateRenderer) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    this.transporter.verify((err, success) => {
      if (err) {
        console.error("❌ SMTP config error:", err);
      } else {
        console.log("✅ SMTP is ready");
      }
    });
  }

  async send(
    to: string,
    subject: string,
    template: string,
    data: any,
    attachments?: Array<{ filename: string; path: string }>
  ): Promise<void> {
    const html = await this.renderer.render(template, data);

    await this.transporter.sendMail(
      {
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
        attachments,
      },
      (err, info) => {
        if (err) {
          console.error("❌ Error sending email:", err);
        } else {
          console.log("✅ Email sent:", info.response);
        }
      }
    );
  }
}
