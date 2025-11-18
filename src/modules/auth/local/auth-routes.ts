import { Router } from 'express';
import {
  register,
  login,
  logout,
  forgotPasswordHandler,
  resetPasswordHandler,
  verifyEmailHandler,
  resendVerification,
} from './auth-controller';
import { authenticateUser } from '../../../core/middleware/authentication';
import {
  authLimiter,
  resetPasswordLimiter,
  verifyEmailLimiter,
} from '../../../core/middleware/rate-limit';
import { validate } from '../../../core/middleware/validation';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from './auth-schema';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticateUser, logout);
router.post(
  '/forgot-password',
  resetPasswordLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);
router.post(
  '/reset-password',
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  resetPasswordHandler
);
router.get(
  '/verify-email/:token',
  verifyEmailLimiter,
  validate(verifyEmailSchema, 'params'),
  verifyEmailHandler
);
router.post(
  '/resend-verification',
  resetPasswordLimiter,
  validate(resendVerificationSchema),
  resendVerification
);

export default router;
