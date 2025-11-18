import { attachCookiesToResponse } from '../../modules/auth/local/auth-service';
import { UnauthenticatedError, UnauthorizedError } from '../errors';
import prisma from '../../configs/prisma';
import { Response, NextFunction, Request } from 'express';
import { JwtPayload } from '../../types';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken, refreshToken } = req.signedCookies;
  try {
    if (accessToken) {
      const payload = jwt.verify(accessToken, env.JWT_SECRET) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          provider: true,
        },
      });

      if (!user || !user.isActive)
        throw new UnauthenticatedError('User not found or disabled');

      req.user = user;
      return next();
    }
    if (refreshToken) {
      const existingToken = await prisma.tokens.findUnique({
        where: { refreshToken },
      });
      if (!existingToken || !existingToken.isValid)
        throw new UnauthenticatedError('Not authorized');
      if (existingToken.expiresAt < new Date())
        throw new UnauthenticatedError('Token expired');

      const user = await prisma.user.findFirst({
        where: { id: existingToken.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          provider: true,
        },
      });

      if (!user || !user.isActive)
        throw new UnauthenticatedError('User not found or disabled');

      attachCookiesToResponse({
        res,
        user,
        refreshToken: existingToken.refreshToken,
        refreshTokenExpiry: existingToken.expiresAt,
      });
      req.user = user;
      return next();
    } else {
      throw new UnauthenticatedError('Not Authorized');
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error;
    throw new UnauthorizedError('Not authorized to access this route');
  }
};
