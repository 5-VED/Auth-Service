import { HTTP_CODES } from "../Common/Constants/enums";
import message from "../Common/Constants/Messages";
import logger from "../Config/Logger";
import UserService from "../Services/User.service";
import { sendResponse } from "../Utils/Auth_Methods";
import { NextFunction, Request, Response } from "express";
const Layer: string = "Controller Layer"


export default class UserController {
	public static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const response = await UserService.create(req.body);

			return sendResponse(res, response, message.USER_CREATED_SUCCESSFULLY, true, HTTP_CODES.OK)
		} catch (error) {
			logger.error(Layer + error)
			next(error);
		}
	}

	public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { email, password } = req.body;
			const response = await UserService.login(email, password);

			// Set JWT token in cookie for enhanced security
			res.cookie('token', response.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 24 * 60 * 60 * 1000 // 24 hours
			});

			sendResponse(res, response, "Login successful", true, HTTP_CODES.OK);
		} catch (error) {
			logger.error(Layer + error);
			next(error);
		}
	}

	public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { email, phoneNo } = req.body
			const response = await UserService.forgotPassword(email, phoneNo)

			sendResponse(res, response, message.PASSWORD_RESET_SUCCESSFULLY, true, HTTP_CODES.OK)
		} catch (error) {
			logger.error(Layer + error);
			next(error);
		}
	}

	public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { email, password } = req.body
			const response = await UserService.resetPassword(email, password)

			sendResponse(res, response, message.PASSWORD_RESET_SUCCESSFULLY, true, HTTP_CODES.OK)
		} catch (error) {
			logger.error(Layer + error);
			next(error);
		}
	}
}   	