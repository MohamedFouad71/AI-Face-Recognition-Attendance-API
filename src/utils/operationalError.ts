class OperationalError extends Error {
  public isOperational: boolean = true;
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default OperationalError;
