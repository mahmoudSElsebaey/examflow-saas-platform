import { Router } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'

const router = Router()

router.get('/', (_req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    service: 'examflow-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }, 'ExamFlow API is healthy')
})

export default router
