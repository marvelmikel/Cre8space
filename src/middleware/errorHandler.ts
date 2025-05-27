import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err);
  
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  // Handle different types of errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
    return;
  }
  
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
    return;
  }
  
  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    res.status(400).json({
      status: 'error',
      message: 'Duplicate entry'
    });
    return;
  }
  
  // Default error response
  res.status(statusCode).json({
    status,
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};