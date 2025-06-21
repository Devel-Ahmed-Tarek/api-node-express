import { EJSTemplateRenderer } from "./EJSTemplateRenderer";
import { NodemailerEmailSender } from "./NodemailerEmailSender";
import { EmailService } from "./EmailService";

const renderer = new EJSTemplateRenderer();
const mailer = new NodemailerEmailSender(renderer);

export const emailService = new EmailService(mailer);
