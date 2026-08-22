import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { requireSuperAdmin } from '../middlewares/superAdmin.js'
import * as ctrl from '../controllers/admin.controller.js'

const router = Router()
router.use(authenticate)
router.use(requireSuperAdmin)

router.get('/metrics', ctrl.metrics)
router.get('/organizations', ctrl.listOrgs)
router.post('/organizations/:orgId/suspend', ctrl.suspendOrg)
router.post('/organizations/:orgId/activate', ctrl.activateOrg)
router.get('/users', ctrl.listUsers)
router.post('/users/:userId/deactivate', ctrl.deactivateUser)
router.post('/users/:userId/activate', ctrl.activateUser)

export default router
