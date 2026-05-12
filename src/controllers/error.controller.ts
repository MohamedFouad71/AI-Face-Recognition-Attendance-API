import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (typeof err === 'string') err = new Error(err);

  const errorPayload: Record<string, any> = {
    success: false,
    error: err.isOperational ? err.message : 'Internal Server Error',
  };

  // non operational errors are needed for the production logs
  if (process.env.NODE_ENV === 'development') {
    errorPayload.error = err.message;
    errorPayload.stack = err.stack;
    console.error(err);
  } else if (!err.isOperational) {
    console.error(err);
  }

  return res.status(err.statusCode || 500).json({
    ...errorPayload,
  });
};

export default errorHandler;
