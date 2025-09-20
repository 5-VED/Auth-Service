import { NextFunction, Request, Response } from 'express';
import logger from '../Config/Logger';
import ApiError from '../Common/ErrorResponse';
import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';

interface ErrorResponse {
    success: boolean;
    message: string;
    stack?: string;
    data?: any;
}

interface ValidationErrorDetail {
    field: string;
    message: string;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // If headers are already sent, delegate to the default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    try {
        logger.error(`Error occurred while processing ${req.method} ${req.path}:`, {
            error: err.message,
            stack: err.stack,
            body: req.body,
            params: req.params,
            query: req.query
        });

        // Set default error response
        let statusCode = 500;
        let response: ErrorResponse = {
            success: false,
            message: 'Internal Server Error',
        };

        // Handle ApiError instances
        if (err instanceof ApiError) {
            statusCode = err.statusCode;
            response = {
                success: false,
                message: err.message,
                data: err.data
            };

            if (process.env.NODE_ENV === 'development') {
                response.stack = err.stack;
            }
        }
        // Handle Sequelize errors
        else if (err instanceof ValidationError) {
            statusCode = 400;
            response = {
                success: false,
                message: 'Validation Error',
                data: err.errors.map((e): ValidationErrorDetail => ({
                    field: e.path || 'unknown',
                    message: e.message
                }))
            };
        }
        else if (err instanceof UniqueConstraintError) {
            statusCode = 409;
            response = {
                success: false,
                message: 'Duplicate Entry Error',
                data: err.errors.map((e): ValidationErrorDetail => ({
                    field: e.path || 'unknown',
                    message: e.message
                }))
            };
        }
        else if (err instanceof ForeignKeyConstraintError) {
            statusCode = 400;
            response = {
                success: false,
                message: 'Invalid Reference Error',
                data: {
                    field: err.fields,
                    table: err.table
                }
            };
        }
        // Handle JSON parsing errors
        else if (err instanceof SyntaxError && 'body' in err) {
            statusCode = 400;
            response.message = 'Invalid JSON';
        }

        // Add stack trace in development environment
        if (process.env.NODE_ENV === 'development') {
            response.stack = err.stack;
        }

        // Send the error response
        return res.status(statusCode).json(response);

    } catch (error) {
        logger.error('Error in error handler:', error);
        // Ensure we send a response even if error handling fails
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
        return next(error);
    }
};

export default errorHandler;
