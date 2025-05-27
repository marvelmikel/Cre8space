import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Validate request middleware
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
    return;
  }
  
  next();
};