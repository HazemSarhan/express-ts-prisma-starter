import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../../configs/prisma';
import {
  BadRequestError,
  UnauthenticatedError,
  InternalServerError,
} from '../../../core/errors';
import { env } from '../../../configs/env';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '../../../core/utils/email';
import { JwtPayload, User } from '../../../types';
import { Response } from 'express';
import { createAccessToken } from '../../../core/utils/jwt';

const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const { name, email, password } = data;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) throw new BadRequestError('Email already in use');

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    const hashedPassword = await hashPassword(password);

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 1);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        provider: 'LOCAL',
        role: isFirstUser ? 'ADMIN' : 'USER',
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        provider: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (error) {
      console.error(error);
    }
    return user;
  } catch (error) {
    console.log(error);
    if (
      error instanceof BadRequestError ||
      error instanceof InternalServerError
    ) {
      throw error;
    }
    throw new InternalServerError(
      error instanceof Error ? error.message : 'Failed to register user'
    );
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  const DUMMY_PASSWORD_HASH = await hashPassword('password');
  const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;

  // Always compare to prevent timing attacks
  const isPasswordValid = await comparePassword(password, passwordHash);

  if (!user || !isPasswordValid) {
    throw new UnauthenticatedError('Invalid email or password');
  }
  if (!user.isActive) {
    throw new UnauthenticatedError('Your account is disabled');
  }
  if (!user.emailVerified) {
    throw new UnauthenticatedError('Please verify your email');
  }

  const refreshToken = crypto.randomBytes(32).toString('hex');

  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(
    refreshTokenExpiry.getDate() + (env.NODE_ENV === 'production' ? 7 : 30)
  );

  await prisma.tokens.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      refreshToken,
      isValid: true,
      expiresAt: refreshTokenExpiry,
    },
    update: { refreshToken, isValid: true, expiresAt: refreshTokenExpiry },
  });
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || null,
      provider: user.provider,
      isActive: user.isActive,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    refreshToken,
    refreshTokenExpiry,
  };
};

export const verifyEmail = async (token: string) => {
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });
  if (!user) throw new BadRequestError('Invalid token');
  if (
    !user.verificationTokenExpiry ||
    user.verificationTokenExpiry < new Date()
  )
    throw new BadRequestError('Token expired');

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      provider: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const refreshToken = crypto.randomBytes(32).toString('hex');

  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(
    refreshTokenExpiry.getDate() + (env.NODE_ENV === 'production' ? 7 : 30)
  );

  await prisma.tokens.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      refreshToken,
      isValid: true,
      expiresAt: refreshTokenExpiry,
    },
    update: { refreshToken, isValid: true, expiresAt: refreshTokenExpiry },
  });
  return {
    message: 'Email verified successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider,
      isActive: user.isActive,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    refreshToken,
    refreshTokenExpiry,
  };
};

export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) throw new BadRequestError('User not found');
  if (user.emailVerified)
    throw new BadRequestError('Email is already verified');
  const verificationToken = generateVerificationToken();
  const verificationTokenExpiry = new Date();
  verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationTokenExpiry },
  });

  try {
    await sendVerificationEmail(user.email, user.name, verificationToken);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && 'statusCode' in error) throw error;
    throw new InternalServerError('Failed to send email');
  }
  return { message: 'Verification email sent successfully' };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    return {
      message:
        'If you have an account with us, check your email for instructions to reset your password',
    };
  }
  if (!user.password) {
    return {
      message:
        'If you have an account with us, check your email for instructions to reset your password',
    };
  }

  const resetPasswordToken = generateVerificationToken();
  const resetPasswordTokenExpiry = new Date();
  resetPasswordTokenExpiry.setHours(resetPasswordTokenExpiry.getHours() + 1);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken, resetPasswordTokenExpiry },
  });

  try {
    await sendPasswordResetEmail(user.email, user.name, resetPasswordToken);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
  return {
    message:
      'If you have an account with us, check your email for instructions to reset your password',
  };
};

export const resetPassword = async (data: {
  password: string;
  token: string;
}) => {
  const { password, token } = data;
  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: token },
  });
  if (!user) throw new BadRequestError('Invalid or expired token');
  if (
    !user.resetPasswordTokenExpiry ||
    user.resetPasswordTokenExpiry < new Date()
  )
    throw new BadRequestError('Invalid or expired token');

  const hashedPassword = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
    },
  });
  return { message: 'Password reset successfully' };
};

export const logoutUser = async (userId: string) => {
  await prisma.tokens.updateMany({
    where: { userId },
    data: { isValid: false },
  });
  return { message: 'Logged out successfully' };
};

export const attachCookiesToResponse = ({
  res,
  user,
  refreshToken,
  refreshTokenExpiry,
}: {
  res: Response;
  user: User;
  refreshToken: string;
  refreshTokenExpiry: Date;
}) => {
  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
  };
  const accessTokenJwt = createAccessToken({ payload });
  const accessTokenExpiry =
    env.NODE_ENV === 'production'
      ? 1000 * 60 * 60 * 1
      : 1000 * 60 * 60 * 24 * 7;

  res.cookie('accessToken', accessTokenJwt, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + accessTokenExpiry),
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    signed: true,
    expires: refreshTokenExpiry,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });

  return { user };
};
