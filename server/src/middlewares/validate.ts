import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import { sendError } from '../utils/apiResponse.js'

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
      return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors)
    }
    req.body = result.data
    next()
  }
}
