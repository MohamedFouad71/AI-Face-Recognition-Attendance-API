import { Request, Response, NextFunction } from 'express';
import OperationalError from '#utils/operationalError.js';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  // Handle plain string errors
  if (typeof err === 'string') error = new Error(err);
  // 1. Mongoose bad ObjectId (CastError)
  else if (error.name === 'CastError') {
    const message = `Resource not found. Invalid: ${error.path}`;
    error = new OperationalError(message, 400);
  }
  // 2. Mongoose duplicate key (Code 11000)
  else if (err.code || (err.cause && (err.cause as any).code) === 11000) {
    const field = Object.keys(error.keyValue || {}).join(', ');
    const message =
      err.message || `Duplicate field value entered for: ${field}. Please use another value.`;
    error = new OperationalError(message, 400);
  }
  // 3. Mongoose validation error
  else if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new OperationalError(message, 400);
  }
  // 4. Invalid Json Syntax
  else if (err.type === 'entity.parse.failed')
    error = new OperationalError('Json Syntax Error', 400);
  // 5. JWT Errors
  else if (error.name === 'JsonWebTokenError') error = new OperationalError('Invalid Token', 401);
  else if (error.name === 'TokenExpiredError')
    error = new OperationalError('Your Token has Expired. Please Log in Again', 401);
  // Fallbacks
  const statusCode = error.statusCode || err.statusCode || 500;
  const isOperational = error.isOperational || err.isOperational || false;

  const errorPayload: Record<string, any> = {
    success: false,
    error: isOperational ? error.message : 'Internal Server Error',
  };

  // Environment-specific logging
  if (process.env.NODE_ENV === 'development') {
    errorPayload.error = error.message;
    errorPayload.stack = err.stack;
    console.error(err);
  } else if (!isOperational) {
    console.error('ERROR', err);
  }

  return res.status(statusCode).json(errorPayload);
};

export default errorHandler;
