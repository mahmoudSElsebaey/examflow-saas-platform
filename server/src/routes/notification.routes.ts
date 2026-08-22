import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import * as ctrl from '../controllers/notification.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', ctrl.list)
router.post('/read-all', ctrl.markAllRead)
router.post('/:id/read', ctrl.markRead)
export default router
