import { IEmailSender } from "../interfaces/IEmailSender";

export class EmailService {
  constructor(private mailer: IEmailSender) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: any,
    attachments?: Array<{ filename: string; path: string }>
  ): Promise<void> {
    return this.mailer.send(to, subject, template, data, attachments);
  }
}
