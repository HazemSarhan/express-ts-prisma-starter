import { Request, Response } from 'express';
import { attachCookiesToResponse } from '../local/auth-service';
import prisma from '../../../configs/prisma';
import { env } from '../../../configs/env';
import { User as SafeUser } from '../../../types';
import { UnauthenticatedError } from '../../../core/errors';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as SafeUser;
    if (!user) {
      throw new UnauthenticatedError('User not found');
    }
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await prisma.tokens.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        refreshToken,
        isValid: true,
        expiresAt: refreshTokenExpiry,
      },
      update: {
        refreshToken,
        isValid: true,
        expiresAt: refreshTokenExpiry,
      },
    });

    attachCookiesToResponse({ res, user, refreshToken, refreshTokenExpiry });
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      data: { user },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new UnauthenticatedError(error.message);
    }
    throw new UnauthenticatedError('Something went wrong');
  }
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as SafeUser;
    if (!user) {
      throw new UnauthenticatedError('User not found');
    }
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await prisma.tokens.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        refreshToken,
        isValid: true,
        expiresAt: refreshTokenExpiry,
      },
      update: {
        refreshToken,
        isValid: true,
        expiresAt: refreshTokenExpiry,
      },
    });

    attachCookiesToResponse({ res, user, refreshToken, refreshTokenExpiry });
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      data: { user },
    });
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new UnauthenticatedError('Something went wrong');
  }
};
