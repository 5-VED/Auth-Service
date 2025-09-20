import {config} from "../Config/config"
import logger from "../Config/Logger";
import { HTTP_CODES } from "./Constants/enums";
import message from "./Constants/Messages";

class ApiError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean
	public readonly data?: any;

	constructor(errorMessage: string, statusCode: number, isOperational = true, data?: any) {
		super(errorMessage);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.data = data;
		
		Error.captureStackTrace(this, this.constructor);
		
		// Log error when created in development
		if (config.isDevelopment) {
			logger.error(`API Error: ${errorMessage}`, {
				statusCode,
				isOperational,
				data,
				stack: this.stack
			});
		}
	}

	static badRequest(errorMessage: string = message.INVALID_PAYLOAD, data?: any) {
		return new ApiError(errorMessage, HTTP_CODES.BAD_REQUEST, true, data);
	}

	static unauthorized(errorMessage: string = message.UNAUTHORIZED, data?: any) {
		return new ApiError(errorMessage, HTTP_CODES.UNAUTHORIZED, true, data);
	}

	static forbidden(errorMessage: string = message.UNAUTHORIZED, data?: any) {
		return new ApiError(errorMessage, HTTP_CODES.FORBIDDEN, true, data);
	}

	static notFound(errorMessage: string = message.NOT_FOUND, data?: any) {
		return new ApiError(errorMessage, HTTP_CODES.NOT_FOUND, true, data);
	}

	static conflict(errorMessage: string = message.DUPLICATE_KEY, data?: any) {
		return new ApiError(errorMessage, HTTP_CODES.DUPLICATE_VALUE, true, data);
	}

	static validationError(errorMessage: string = message.INVALID_PAYLOAD, data?: any) {
		return new ApiError(errorMessage, HTTP_CODES.VALIDATION_ERROR, true, data);
	}

	static internal(errorMessage: string = message.INTERNAL_SERVER_ERROR, data?: any) {
		return new ApiError(errorMessage, HTTP_CODES.INTERNAL_SERVER_ERROR, false, data);
	}
}

export default ApiError;
