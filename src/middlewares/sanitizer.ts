import { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

const sanitizer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' }) as typeof req.body;
  }

  req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });

  next();
};

export default sanitizer;
