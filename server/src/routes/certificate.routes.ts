import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { requireOrgMember } from '../middlewares/tenant.js'
import * as ctrl from '../controllers/certificate.controller.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireOrgMember)

router.get('/certificates', ctrl.list)
router.get('/certificates/:certId', ctrl.getOne)
router.post('/attempts/:attemptId/certificate', ctrl.issue)

export default router
