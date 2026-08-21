import type { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/apiResponse.js'
import { config } from '../config/index.js'

export class AppError extends Error {
  statusCode: number
  errorCode?: string
  isOperational: boolean

  constructor(message: string, statusCode = 500, errorCode?: string) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  return sendError(res, 'Resource not found', 404, 'NOT_FOUND')
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode)
  }

  // Unexpected errors
  console.error('[Unhandled Error]', err)

  const message = config.isProd
    ? 'Internal server error'
    : err.message || 'Internal server error'

  return sendError(res, message, 500, 'INTERNAL_ERROR')
}
