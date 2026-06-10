import OperationalError from '#utils/operationalError.js';
import { NextFunction, Request, Response } from 'express';

const doesBodyExists = (req: Request, res: Response, next: NextFunction) => {
  const targetMethods = ['POST', 'PATCH'];

  if (targetMethods.includes(req.method) && !req.body)
    throw new OperationalError('Request Body is Empty', 400);

  next();
};

export default doesBodyExists;
