import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { validateBody } from '../middlewares/validate.js'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateMemberStatusSchema,
  transferOwnershipSchema,
} from '../validators/organization.validators.js'
import * as ctrl from '../controllers/organization.controller.js'
import * as profileCtrl from '../controllers/memberProfile.controller.js'
import { z } from 'zod'

const router = Router()

const acceptInviteSchema = z.object({ token: z.string().min(10) })

router.use(authenticate)

router.post('/', validateBody(createOrganizationSchema), ctrl.createOrg)
router.get('/', ctrl.listOrgs)
router.post('/accept-invite', validateBody(acceptInviteSchema), ctrl.acceptInvite)

router.get('/:orgId', ctrl.getOrg)
router.patch('/:orgId', validateBody(updateOrganizationSchema), ctrl.updateOrg)
router.post('/:orgId/leave', ctrl.leaveOrg)
router.post(
  '/:orgId/transfer-ownership',
  validateBody(transferOwnershipSchema),
  ctrl.transferOwnership
)

router.get('/:orgId/members', ctrl.listMembers)
router.post(
  '/:orgId/members',
  validateBody(inviteMemberSchema),
  ctrl.inviteMember
)
router.get('/:orgId/members/:userId/profile', profileCtrl.getMemberProfile)
router.get('/:orgId/invites', ctrl.listPendingInvites)
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
