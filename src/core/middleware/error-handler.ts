import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { APIError, InternalServerError } from '../errors';
import { ApiErrorResponse } from '../../types/api';
import { PrismaError } from '../../types/prisma';
import { env } from '../../configs/env';

const errorHandlerMiddleware = (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle custom API errors
  if (err instanceof APIError) {
    const apiError: ApiErrorResponse = {
      success: false,
      status: err.statusCode,
      message: err.message,
    };

    return res.status(err.statusCode).json(apiError);
  }

  // Handle validation errors (from express-validator or similar)
  if (err.name === 'ValidationError') {
    const apiError: ApiErrorResponse = {
      success: false,
      status: StatusCodes.BAD_REQUEST,
      message: err.message || 'Validation error',
    };

    return res.status(StatusCodes.BAD_REQUEST).json(apiError);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const apiError: ApiErrorResponse = {
      success: false,
      status: StatusCodes.UNAUTHORIZED,
      message: 'Invalid or expired token',
    };

    return res.status(StatusCodes.UNAUTHORIZED).json(apiError);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as PrismaError;

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const apiError: ApiErrorResponse = {
        success: false,
        status: StatusCodes.CONFLICT,
        message: 'Resource already exists',
      };

      return res.status(StatusCodes.CONFLICT).json(apiError);
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      const apiError: ApiErrorResponse = {
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: 'Resource not found',
      };

      return res.status(StatusCodes.NOT_FOUND).json(apiError);
    }
  }

  if (env.NODE_ENV === 'development') {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error('Error:', {
      name: err.name,
    });
  }

  const internalError = new InternalServerError(
    env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message || 'Internal server error'
  );

  const apiError: ApiErrorResponse = {
    success: false,
    status: internalError.statusCode,
    message: internalError.message,
  };

  res.status(internalError.statusCode).json(apiError);
};

export default errorHandlerMiddleware;
