import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../Config/config';
import { sendResponse } from '../Utils/Auth_Methods';
import { HTTP_CODES } from '../Common/Constants/enums';
import logger from '../Config/Logger';

export default class SocialAuthController {
	public static async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const user: any = (req as any).user;
			if (!user) {
				return sendResponse(res, null, 'Authentication failed', false, HTTP_CODES.UNAUTHORIZED);
			}

			const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwt.secret as string, { expiresIn: '24h' });
			res.cookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'development',
				sameSite: 'strict',
				maxAge: 24 * 60 * 60 * 1000
			});
			res.redirect(process.env.POST_LOGIN_REDIRECT_URL || '/');
		} catch (error) {
			logger.error('Google callback error: ' + error);
			next(error);
		}
	}

	public static async facebookCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const user: any = (req as any).user;
			if (!user) {
				return sendResponse(res, null, 'Authentication failed', false, HTTP_CODES.UNAUTHORIZED);
			}
			const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwt.secret as string, { expiresIn: '24h' });
			res.cookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'development',
				sameSite: 'strict',
				maxAge: 24 * 60 * 60 * 1000
			});
			res.redirect(process.env.POST_LOGIN_REDIRECT_URL || '/');
		} catch (error) {
			logger.error('Facebook callback error: ' + error);
			next(error);
		}
	}

	public static async appleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const user: any = (req as any).user;
			if (!user) {
				return sendResponse(res, null, 'Authentication failed', false, HTTP_CODES.UNAUTHORIZED);
			}
			const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwt.secret as string, { expiresIn: '24h' });
			res.cookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'development',
				sameSite: 'strict',
				maxAge: 24 * 60 * 60 * 1000
			});
			res.redirect(process.env.POST_LOGIN_REDIRECT_URL || '/');
		} catch (error) {
			logger.error('Apple callback error: ' + error);
			next(error);
		}
	}
}


