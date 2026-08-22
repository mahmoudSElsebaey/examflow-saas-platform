import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import * as notifService from '../services/notification.service.js'

export async function list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await notifService.listNotifications(req.user!.id)
    return sendSuccess(res, data)
  } catch (e) {
    next(e)
  }
}

export async function markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!
    await notifService.markRead(req.user!.id, id)
    return sendSuccess(res, null, 'Marked as read')
  } catch (e) {
    next(e)
  }
}

export async function markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await notifService.markAllRead(req.user!.id)
    return sendSuccess(res, null, 'All marked as read')
  } catch (e) {
    next(e)
  }
}
