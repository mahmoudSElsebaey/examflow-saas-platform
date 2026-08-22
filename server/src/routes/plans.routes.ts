import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import * as ctrl from '../controllers/billing.controller.js'

const router = Router()
router.get('/billing/plans', authenticate, ctrl.listPlans)
export default router
