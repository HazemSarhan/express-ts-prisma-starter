import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../types';
import { env } from '../../configs/env';

export const createAccessToken = ({
  payload,
}: {
  payload: JwtPayload;
}): string => {
  if (!env.JWT_SECRET) throw new Error('JWT_SECRET is not defiend');
  const accessTokenExpiry = env.NODE_ENV === 'production' ? '1d' : '7d';
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: accessTokenExpiry });
};
