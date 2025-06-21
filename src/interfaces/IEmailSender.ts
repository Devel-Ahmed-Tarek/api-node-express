export interface IEmailSender {
  send(
    to: string,
    subject: string,
    template: string,
    data: any,
    attachments?: Array<{ filename: string; path: string }>
  ): Promise<void>;
}
