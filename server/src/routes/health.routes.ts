import { Router } from 'express'
import mongoose from 'mongoose'
import { sendSuccess } from '../utils/apiResponse.js'

const router = Router()
const startedAt = Date.now()

router.get('/', (_req, res) => {
  const dbState = mongoose.connection.readyState
  const db =
    dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected'

  return sendSuccess(
    res,
    {
      status: db === 'connected' ? 'ok' : 'degraded',
      service: 'examflow-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      database: db,
    },
    'ExamFlow API health'
  )
})

export default router
