import { Request, Response, NextFunction } from 'express';
import OperationalError from '#utils/operationalError.js';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  // Handle plain string errors
  if (typeof err === 'string') error = new OperationalError(err, 500);

  // 1. Mongoose bad ObjectId (CastError)
  if (error.name === 'CastError') {
    const message = `Resource not found. Invalid: ${error.path}`;
    error = new OperationalError(message, 400);
  }

  // 2. Mongoose duplicate key (Code 11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {}).join(', ');
    const message = `Duplicate field value entered for: ${field}. Please use another value.`;
    error = new OperationalError(message, 400);
  }

  // 3. Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new OperationalError(message, 400);
  }

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
