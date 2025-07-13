import { NextFunction, Request, Response } from 'express';
import config from '../../config';

const originCheck = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (!origin || !origin.includes(config.frontend_url as string)) {
    throw new Error('Unauthorized');
  }
  next();
};

export default originCheck;
