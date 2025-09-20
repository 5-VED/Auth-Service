import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as FacebookProfile } from 'passport-facebook';
import ApiError from '../Common/ErrorResponse';
import { LAYER, SOCIAL_PROVIDER } from '../Common/Constants/enums';
import logger from '../Config/Logger';
import sequelize from '../Database/PostgresConnection';
import { AuthRepository, UserRepository } from '../Repository';

export class SocialAuthService {
	public static async authenticateGoogle({ accessToken, refreshToken, profile }: { accessToken: string; refreshToken: string; profile: GoogleProfile; }) {
		const transaction = await sequelize.transaction();
		try {
			const providerId = profile.id;
			if (!providerId) {
				throw ApiError.validationError('Invalid Google profile');
			}

			let auth = await AuthRepository.findByProvider(SOCIAL_PROVIDER.GOOGLE, providerId, transaction);
			let user: any = null;

			if (auth) {
				user = await UserRepository.findUserByPK(auth.userId);
				await AuthRepository.updateById(auth.id, { lastLogin: new Date(), accessToken, refreshToken }, transaction);
			} else {
				const email = profile.emails?.[0]?.value;
				if (email) {
					user = await UserRepository.findUserByEmail(email, transaction);
				}
				if (!user) {
					throw ApiError.validationError('Account not found. Please sign up to continue.');
				}
				auth = await AuthRepository.create({
					userId: user.id,
					provider: SOCIAL_PROVIDER.GOOGLE,
					providerId,
					accessToken,
					refreshToken,
					metadata: {
						email,
						firstName: profile.name?.givenName,
						lastName: profile.name?.familyName,
						picture: profile.photos?.[0]?.value
					},
					lastLogin: new Date()
				}, transaction);
			}

			await transaction.commit();
			return user;
		} catch (error) {
			await transaction.rollback();
			logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
			throw error;
		}
	}

	public static async authenticateFacebook({ accessToken, refreshToken, profile }: { accessToken: string; refreshToken: string; profile: FacebookProfile; }) {
		const transaction = await sequelize.transaction();
		try {
			const providerId = profile.id;
			if (!providerId) throw ApiError.validationError('Invalid Facebook profile');

			let auth = await AuthRepository.findByProvider(SOCIAL_PROVIDER.FACEBOOK, providerId, transaction);
			let user: any = null;
			if (auth) {
				user = await UserRepository.findUserByPK(auth.userId);
				await AuthRepository.updateById(auth.id, { lastLogin: new Date(), accessToken, refreshToken }, transaction);
			} else {
				const email = (profile.emails && profile.emails[0]?.value) || undefined;
				if (email) user = await UserRepository.findUserByEmail(email, transaction);
				if (!user) throw ApiError.validationError('Account not found. Please sign up to continue.');
				auth = await AuthRepository.create({
					userId: user.id,
					provider: SOCIAL_PROVIDER.FACEBOOK,
					providerId,
					accessToken,
					refreshToken,
					metadata: {
						email,
						firstName: (profile as any).name?.givenName,
						lastName: (profile as any).name?.familyName,
						picture: profile.photos?.[0]?.value
					},
					lastLogin: new Date()
				}, transaction);
			}
			await transaction.commit();
			return user;
		} catch (error) {
			await transaction.rollback();
			logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
			throw error;
		}
	}

	public static async authenticateApple({ accessToken, refreshToken, idToken, profile }: { accessToken: string; refreshToken: string; idToken: string; profile: any; }) {
		const transaction = await sequelize.transaction();
		try {
			const providerId = profile?.id || profile?.sub;
			if (!providerId) throw ApiError.validationError('Invalid Apple profile');

			let auth = await AuthRepository.findByProvider(SOCIAL_PROVIDER.APPLE, providerId, transaction);
			let user: any = null;
			if (auth) {
				user = await UserRepository.findUserByPK(auth.userId);
				await AuthRepository.updateById(auth.id, { lastLogin: new Date(), accessToken, refreshToken, sessionToken: idToken }, transaction);
			} else {
				const email = profile.email as string | undefined;
				if (email) user = await UserRepository.findUserByEmail(email, transaction);
				if (!user) throw ApiError.validationError('Account not found. Please sign up to continue.');
				auth = await AuthRepository.create({
					userId: user.id,
					provider: SOCIAL_PROVIDER.APPLE,
					providerId,
					accessToken,
					refreshToken,
					sessionToken: idToken,
					metadata: {
						email,
						firstName: profile.name?.firstName,
						lastName: profile.name?.lastName
					},
					lastLogin: new Date()
				}, transaction);
			}
			await transaction.commit();
			return user;
		} catch (error) {
			await transaction.rollback();
			logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
			throw error;
		}
	}
}


