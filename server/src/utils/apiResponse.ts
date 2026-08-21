import type { Response } from 'express'

export interface ApiSuccessResponse<T = unknown> {
  success: true
  message?: string
  data?: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errorCode?: string
  errors?: unknown[]
}

export function sendSuccess<
  T
>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  }
  return res.status(statusCode).json(body)
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errorCode?: string,
  errors?: unknown[]
) {
  const body: ApiErrorResponse = {
    success: false,
    message,
    ...(errorCode && { errorCode }),
    ...(errors && { errors }),
  }
  return res.status(statusCode).json(body)
}
