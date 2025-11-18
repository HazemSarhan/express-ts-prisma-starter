import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  resetPassword,
  forgotPassword,
  attachCookiesToResponse,
} from './auth-service';
import { env } from '../../../configs/env';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResendVerificationSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from './auth-schema';
import { User } from '../../../types';

export const register = async (req: Request, res: Response) => {
  const { name, email, password }: RegisterSchema = req.body;
  const user = await registerUser({ name, email, password });
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message:
      'Registration successful. Please check your email to verify your account.',
    data: { user },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password }: LoginSchema = req.body;
  const { user, refreshToken, refreshTokenExpiry } = await loginUser({
    email,
    password,
  });
  attachCookiesToResponse({ user, res, refreshToken, refreshTokenExpiry });
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Login successful',
    data: { user },
  });
};

export const verifyEmailHandler = async (
  req: Request<{ token: string }>,
  res: Response
) => {
  const { token }: VerifyEmailSchema = req.params;
  const { user, refreshToken, refreshTokenExpiry } = await verifyEmail(token);

  attachCookiesToResponse({
    res,
    user,
    refreshToken,
    refreshTokenExpiry,
  });
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Email verified successfully',
    data: { user },
  });
};

export const resendVerification = async (req: Request, res: Response) => {
  const { email }: ResendVerificationSchema = req.body;
  const result = await resendVerificationEmail(email);
  return res.status(StatusCodes.OK).json({
    success: true,
    message: result.message,
  });
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const { email }: ForgotPasswordSchema = req.body;
  const result = await forgotPassword(email);
  return res.status(StatusCodes.OK).json({
    success: true,
    message: result.message,
  });
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { token, password }: ResetPasswordSchema = req.body;
  const result = await resetPassword({ token, password });
  return res.status(StatusCodes.OK).json({
    success: true,
    message: result.message,
  });
};

export const logout = async (req: Request, res: Response) => {
  const userId = (req.user as User)?.id;
  if (!userId)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Unauthorized' });
  await logoutUser(userId);
  res.cookie('accessToken', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(0),
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(0),
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  return res
    .status(StatusCodes.OK)
    .json({ message: 'Logged out successfully' });
};
