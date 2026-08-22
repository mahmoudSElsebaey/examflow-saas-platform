import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { requireOrgMember, requireOrgRoles } from '../middlewares/tenant.js'
import { validateBody } from '../middlewares/validate.js'
import { z } from 'zod'
import * as ctrl from '../controllers/billing.controller.js'

const router = Router({ mergeParams: true })

const changePlanSchema = z.object({
  plan: z.enum(['free', 'professional', 'enterprise']),
})

router.use(authenticate)
router.use(requireOrgMember)
router.get('/billing', ctrl.getOrgBilling)
router.post(
  '/billing/plan',
  requireOrgRoles('owner', 'admin'),
  validateBody(changePlanSchema),
  ctrl.changePlan
)

export default router
