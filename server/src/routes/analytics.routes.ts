import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { requireOrgMember, requireOrgRoles } from '../middlewares/tenant.js'
import * as ctrl from '../controllers/analytics.controller.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireOrgMember)

const staff = requireOrgRoles('owner', 'admin', 'teacher', 'examiner')

router.get('/analytics', staff, ctrl.orgAnalytics)
router.get('/analytics/export/attempts.csv', staff, ctrl.exportOrgAttemptsCsv)
router.get('/exams/:examId/analytics', staff, ctrl.examAnalytics)
router.get('/exams/:examId/analytics/export.csv', staff, ctrl.exportExamAttemptsCsv)
router.get('/analytics/me', ctrl.studentHistory)

export default router
