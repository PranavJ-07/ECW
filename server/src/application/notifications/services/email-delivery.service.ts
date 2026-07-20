import nodemailer from 'nodemailer';
import { env } from '../../../config';
import { logger } from '../../../infrastructure/logger';

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends notification emails when SMTP is configured; logs and skips otherwise.
 */
export class EmailDeliveryService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async send(input: SendEmailInput): Promise<boolean> {
    if (!this.transporter) {
      logger.debug({ to: input.to, subject: input.subject }, 'Email skipped — SMTP not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM ?? 'EthiCraft <noreply@ethicraft.com>',
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html ?? `<p>${input.text}</p>`,
      });

      return true;
    } catch (error) {
      logger.error({ err: error, to: input.to }, 'Failed to send notification email');
      return false;
    }
  }
}

export const emailDeliveryService = new EmailDeliveryService();
