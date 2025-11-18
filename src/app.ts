import dotenv from 'dotenv';
dotenv.config();
import { env } from './configs/env';
import express from 'express';
const app = express();

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import session from 'express-session';
import { corsConfig } from './configs/cors';
import { helmetConfig } from './configs/helmet';
import passport from 'passport';

import authRoutes from './modules/auth/local/auth-routes';
import oauthRoutes from './modules/auth/oauth/oauth-routes';

import notFoundMiddleware from './core/middleware/not-found';
import errorHandlerMiddleware from './core/middleware/error-handler';

app.use(corsConfig);
app.use(helmetConfig);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.JWT_SECRET));
app.use(
  session({
    secret: env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      signed: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/oauth', oauthRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
