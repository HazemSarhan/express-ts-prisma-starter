import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../../../configs/env';
import { authenticateOAuthUser } from '../oauth/oauth-service';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Email not found'), false);
        }

        const user = await authenticateOAuthUser({
          provider: 'GOOGLE',
          providerId: profile.id,
          email,
          name: profile.displayName,
          image: profile.photos?.[0]?.value || null,
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);
