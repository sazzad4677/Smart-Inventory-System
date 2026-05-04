import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Generic utility to send emails using the configured SMTP transporter.
 */
export const sendEmail = async (options: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Smart Inventory System" <${config.email.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error sending email: ${errorMessage}`);
    throw error;
  }
};

/**
 * Sends a welcome invitation email to a new user with a signup link containing the unique token.
 */
export const sendInvitationEmail = async (email: string, token: string) => {
  const signupLink = `${config.cors.clientUrl}/signup?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome to Smart Inventory System</h2>
      <p>Hello,</p>
      <p>You have been invited to join the <strong>Smart Inventory System</strong>. Please use the link below to create your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${signupLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Now</a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 Smart Inventory System</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'You have been invited to join Smart Inventory System',
    html,
  });
};
