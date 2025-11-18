import { User as SafeUser } from './user';

declare global {
  namespace Express {
    type User = SafeUser | Record<string, any>;

    interface Request {
      user?: User;
    }
  }
}
