import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { requireOrgMember, requireOrgRoles } from '../middlewares/tenant.js'
import { validateBody } from '../middlewares/validate.js'
import {
  createCourseSchema,
  updateCourseSchema,
  createBankSchema,
  updateBankSchema,
  createQuestionSchema,
  updateQuestionSchema,
} from '../validators/content.validators.js'
import * as ctrl from '../controllers/content.controller.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireOrgMember)

const canManage = requireOrgRoles('owner', 'admin', 'teacher', 'examiner')

router.get('/courses', ctrl.listCourses)
router.post('/courses', canManage, validateBody(createCourseSchema), ctrl.createCourse)
router.patch(
  '/courses/:courseId',
  canManage,
  validateBody(updateCourseSchema),
  ctrl.updateCourse
)
router.delete('/courses/:courseId', canManage, ctrl.deleteCourse)

router.get('/banks', ctrl.listBanks)
router.post('/banks', canManage, validateBody(createBankSchema), ctrl.createBank)
router.get('/banks/:bankId', ctrl.getBank)
router.patch(
  '/banks/:bankId',
  canManage,
  validateBody(updateBankSchema),
  ctrl.updateBank
)
router.delete('/banks/:bankId', canManage, ctrl.deleteBank)

router.get('/banks/:bankId/questions', ctrl.listQuestions)
router.post('/banks/:bankId/questions/import', canManage, ctrl.importQuestions)
router.post(
  '/banks/:bankId/questions',
  canManage,
  validateBody(createQuestionSchema),
  ctrl.createQuestion
)
router.patch(
  '/questions/:questionId',
  canManage,
  validateBody(updateQuestionSchema),
  ctrl.updateQuestion
)
router.delete('/questions/:questionId', canManage, ctrl.deleteQuestion)

export default router
