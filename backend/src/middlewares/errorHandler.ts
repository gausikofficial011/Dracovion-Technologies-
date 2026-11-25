import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req as any).requestId || 'req_' + Date.now().toString(36);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    logger.warn('Validation error', {
      requestId,
      path: req.path,
      method: req.method,
      issues: err.errors,
    });

    res.status(400).json({
      success: false,
      requestId,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Operational Server Error', err, { requestId, path: req.path });
    } else {
      logger.warn('Operational Client Error', {
        requestId,
        path: req.path,
        status: err.statusCode,
        message: err.message,
      });
    }

    res.status(err.statusCode).json({
      success: false,
      requestId,
      error: {
        code: err.constructor.name.toUpperCase(),
        message: err.message,
        details: err.errors,
      },
    });
    return;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'record';
    res.status(409).json({
      success: false,
      requestId,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: `A record with this ${field} already exists.`,
      },
    });
    return;
  }

  // Handle unhandled errors
  logger.error('Unhandled Internal Server Error', err, {
    requestId,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    requestId,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An internal error occurred. Please contact support.'
          : err.message || 'Unknown server error',
    },
  });
}
