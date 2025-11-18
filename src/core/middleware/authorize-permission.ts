import { UnauthorizedError } from '../errors';
import { Response, NextFunction, Request } from 'express';
import { User } from '../../types';

export const authorizePermission = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!roles.includes((req.user as User)?.role as string)) {
        throw new UnauthorizedError('Unauthorized to access this route');
      }
      next();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new UnauthorizedError('Unauthorized to access this route');
    }
  };
};
