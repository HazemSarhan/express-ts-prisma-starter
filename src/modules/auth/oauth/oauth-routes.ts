import { Router } from 'express';
import { googleCallback, githubCallback } from './oauth-controller';
import passport from 'passport';
import { authLimiter } from '../../../core/middleware/rate-limit';

const router = Router();

router.get(
  '/google',
  authLimiter,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  authLimiter,
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  googleCallback
);

router.get(
  '/github',
  authLimiter,
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  authLimiter,
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login',
  }),
  githubCallback
);

export default router;
