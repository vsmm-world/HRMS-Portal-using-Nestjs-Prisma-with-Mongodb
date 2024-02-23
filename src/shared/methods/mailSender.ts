import { env } from 'process';
import * as postmark from 'postmark';

export class MailSender {
  static async SendMailWithAttachment(
    email,
    attachmentName,
    attachmentBuffer,
    subject,
    body,
  ) {
    console.log('some one hit the mail sender');
    const client = new postmark.ServerClient(env.POST_MARK_API_KEY);

    let message = new postmark.Models.Message(
      env.FROM_MAIL,
      `${subject}`,
      `${body}`,
      'Find the attachment below',
      `${email}`,
    );

    const attachment = new postmark.Models.Attachment(
      `${attachmentName}`,
      Buffer.from(attachmentBuffer).toString('base64'),
      'application/pdf',
    );
    message.Attachments = [attachment];

    client.sendEmail(message);
  }
}
