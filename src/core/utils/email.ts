import resend from '../../configs/resend';
import { env } from '../../configs/env';
import { InternalServerError } from '../errors';
import { SendEmailOptions } from '../../types';

if (!env.EMAIL || !env.RESEND_API_KEY)
  throw new InternalServerError('Email not configured');

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Company <${env.EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    if (error)
      throw new InternalServerError(`Failed to send email: ${error.message}`);
    return data;
  } catch (error) {
    if (error instanceof InternalServerError) throw error;
    console.error(error);
    throw new InternalServerError('Failed to send email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string | null,
  verificationToken: string
) => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const html = `
    <p>Hi ${name || 'there'},</p>
    <p>Thanks for signing up! Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
    `;
  return sendEmail({
    to: email,
    subject: 'Verify your email address',
    html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string | null,
  resetToken: string
) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const html = `
    <p>Hi ${name || 'there'},</p>
    <p>You have requested to reset your password. Please click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    `;
  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html,
  });
};
