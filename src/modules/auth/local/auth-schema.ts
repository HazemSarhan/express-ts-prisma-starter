import * as z from 'zod';

export const registerSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z
    .string('Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
      'Password must contain at least one letter and one number'
    ),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
      'Password must contain at least one letter and one number'
    ),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resendVerificationSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
      'Password must contain at least one letter and one number'
    ),
  token: z.string(),
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResendVerificationSchema = z.infer<typeof resendVerificationSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
