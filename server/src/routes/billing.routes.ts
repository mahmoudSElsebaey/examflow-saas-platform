import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { requireOrgMember, requireOrgRoles } from '../middlewares/tenant.js'
import { validateBody } from '../middlewares/validate.js'
import { z } from 'zod'
import * as ctrl from '../controllers/billing.controller.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireOrgMember)

const canBill = requireOrgRoles('owner', 'admin')

const planSchema = z.object({
  plan: z.enum(['free', 'professional', 'enterprise']),
})

router.get('/billing', ctrl.getOrgBilling)
router.post('/billing/plan', canBill, validateBody(planSchema), ctrl.changePlan)
router.post('/billing/portal', canBill, ctrl.billingPortal)

export default router
