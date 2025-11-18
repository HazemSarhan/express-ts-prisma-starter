import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github2';
import { env } from '../../../configs/env';
import { authenticateOAuthUser } from '../oauth/oauth-service';
import type { Profile as PassportProfile } from 'passport';

interface GithubProfile extends PassportProfile {
  emails?: { value: string }[];
  photos?: { value: string }[];
}

passport.use(
  new GithubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GithubProfile,
      done: (err: any, user?: any) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Email not found'), false);
        }
        const user = await authenticateOAuthUser({
          provider: 'GITHUB',
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
