import { Request, Response, NextFunction } from 'express';
import OperationalError from '#utils/operationalError.js';

const unhandledRoutes = (req: Request, res: Response, next: NextFunction) => {
  next(new OperationalError('Route not found', 400));
};

export default unhandledRoutes;
