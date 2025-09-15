import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { Request } from 'express';

// Ensure env vars exist at runtime; throw clear errors in development
const {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_CALLBACK_URL
} = process.env as Record<string, string | undefined>;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
	if (process.env.NODE_ENV !== 'production') {
		console.warn('Google OAuth env vars are missing. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL');
	}
}

// Configure Google OAuth2 strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: GOOGLE_CLIENT_ID || '',
			clientSecret: GOOGLE_CLIENT_SECRET || '',
			callbackURL: GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
			passReqToCallback: true
		},
		async (
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			done: (err: any, user?: any, info?: any) => void
		) => {
			try {
				// We only pass through the raw Google data; user creation/linking happens in route via service
				return done(null, {
					provider: 'google',
					profile,
					tokens: {
						accessToken,
						refreshToken
					},
					// Forward state/redirect if present
					state: (req.query && (req.query.state as string)) || undefined
				});
			} catch (error) {
				return done(error as Error);
			}
		}
	)
);

// No sessions used; JWT only. Serialize/deserialize are no-ops for completeness.
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => done(null, user as any));
passport.deserializeUser((obj: any, done: (err: any, user?: any) => void) => done(null, obj as any));

export default passport;


