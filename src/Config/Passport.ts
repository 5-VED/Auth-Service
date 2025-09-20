import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import logger from './Logger';
import ApiError from '../Common/ErrorResponse';
import { SocialAuthService } from '../Services/SocialAuth.service';

export function configurePassport(): void {
	const clientID = process.env.GOOGLE_CLIENT_ID as string;
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
	const callbackURL = process.env.GOOGLE_CALLBACK_URL as string;

	if (!clientID || !clientSecret || !callbackURL) {
		logger.warn('Google OAuth env vars are not fully configured. Skipping Google strategy setup.');
		return;
	}

	passport.use(
		'google',
		new GoogleStrategy(
			{
				clientID,
				clientSecret,
				callbackURL,
			},
			async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (err: any, user?: any, info?: any) => void) => {
				try {
					const user = await SocialAuthService.authenticateGoogle({ accessToken, refreshToken, profile });
					return done(null, user);
				} catch (error) {
					if (error instanceof ApiError) {
						return done(null, false, { message: error.message });
					}
					return done(error as Error);
				}
			}
		)
	);

	// Facebook Strategy
	const fbAppId = process.env.FACEBOOK_APP_ID as string;
	const fbAppSecret = process.env.FACEBOOK_APP_SECRET as string;
	const fbCallbackURL = process.env.FACEBOOK_CALLBACK_URL as string;

	if (!fbAppId || !fbAppSecret || !fbCallbackURL) {
		logger.warn('Facebook OAuth env vars are not fully configured. Skipping Facebook strategy setup.');
	} else {
		passport.use(
			'facebook',
			new FacebookStrategy(
				{
					clientID: fbAppId,
					clientSecret: fbAppSecret,
					callbackURL: fbCallbackURL,
					profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
					enableProof: true,
				},
				async (accessToken: string, refreshToken: string, profile: FacebookProfile, done: (err: any, user?: any, info?: any) => void) => {
					try {
						const user = await SocialAuthService.authenticateFacebook({ accessToken, refreshToken, profile });
						return done(null, user);
					} catch (error) {
						if (error instanceof ApiError) {
							return done(null, false, { message: error.message });
						}
						return done(error as Error);
					}
				}
			)
		);
	}

	// Apple Strategy (conditionally require to avoid type issues if not installed)
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const AppleStrategy = require('passport-apple');
		const appleClientID = process.env.APPLE_CLIENT_ID as string;
		const appleTeamID = process.env.APPLE_TEAM_ID as string;
		const appleKeyID = process.env.APPLE_KEY_ID as string;
		const applePrivateKey = process.env.APPLE_PRIVATE_KEY as string;
		const appleCallbackURL = process.env.APPLE_CALLBACK_URL as string;

		if (!appleClientID || !appleTeamID || !appleKeyID || !applePrivateKey || !appleCallbackURL) {
			logger.warn('Apple Sign-In env vars are not fully configured. Skipping Apple strategy setup.');
		} else {
			passport.use(
				'apple',
				new AppleStrategy(
					{
						clientID: appleClientID,
						teamID: appleTeamID,
						keyID: appleKeyID,
						privateKey: applePrivateKey,
						callbackURL: appleCallbackURL,
						scope: ['name', 'email'],
					},
					async (accessToken: string, refreshToken: string, idToken: string, profile: any, done: (err: any, user?: any, info?: any) => void) => {
						try {
							const user = await SocialAuthService.authenticateApple({ accessToken, refreshToken, idToken, profile });
							return done(null, user);
						} catch (error) {
							if (error instanceof ApiError) {
								return done(null, false, { message: error.message });
							}
							return done(error as Error);
						}
					}
				)
			);
		}
	} catch (err) {
		logger.warn('passport-apple not installed or failed to load. Apple strategy not configured.');
	}
}


