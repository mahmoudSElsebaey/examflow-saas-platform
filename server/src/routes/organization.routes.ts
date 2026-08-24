import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { validateBody } from '../middlewares/validate.js'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateMemberStatusSchema,
} from '../validators/organization.validators.js'
import * as ctrl from '../controllers/organization.controller.js'

const router = Router()

router.use(authenticate)

router.post('/', validateBody(createOrganizationSchema), ctrl.createOrg)
router.get('/', ctrl.listOrgs)
router.get('/:orgId', ctrl.getOrg)
router.patch('/:orgId', validateBody(updateOrganizationSchema), ctrl.updateOrg)
router.get('/:orgId/members', ctrl.listMembers)
router.post(
  '/:orgId/members',
  validateBody(inviteMemberSchema),
  ctrl.inviteMember
)
router.patch(
  '/:orgId/members/:membershipId',
  validateBody(updateMemberRoleSchema),
  ctrl.updateMemberRole
)
router.patch(
  '/:orgId/members/:membershipId/status',
  validateBody(updateMemberStatusSchema),
  ctrl.setMemberStatus
)
router.delete('/:orgId/members/:membershipId', ctrl.removeMember)

export default router
