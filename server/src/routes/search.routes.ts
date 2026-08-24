import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { requireOrgMember } from '../middlewares/tenant.js'
import * as ctrl from '../controllers/search.controller.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireOrgMember)

router.get('/search', ctrl.orgSearch)

export default router
