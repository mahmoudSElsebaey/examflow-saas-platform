import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { requireOrgMember, requireOrgRoles } from '../middlewares/tenant.js'
import { validateBody } from '../middlewares/validate.js'
import {
  createExamSchema,
  updateExamSchema,
  saveAnswersSchema,
  submitAttemptSchema,
  manualGradeSchema,
} from '../validators/exam.validators.js'
import * as ctrl from '../controllers/exam.controller.js'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.use(requireOrgMember)

const canManage = requireOrgRoles('owner', 'admin', 'teacher', 'examiner')

router.get('/exams', ctrl.listExams)
router.get('/exams/available', ctrl.listAvailableExams)
router.post('/exams', canManage, validateBody(createExamSchema), ctrl.createExam)
router.get('/exams/:examId', ctrl.getExam)
router.patch(
  '/exams/:examId',
  canManage,
  validateBody(updateExamSchema),
  ctrl.updateExam
)
router.post('/exams/:examId/publish', canManage, ctrl.publishExam)
router.delete('/exams/:examId', canManage, ctrl.archiveExam)

router.post('/exams/:examId/attempts', ctrl.startAttempt)
router.get('/exams/:examId/attempts/me', ctrl.listMyAttempts)

router.get('/attempts/:attemptId', ctrl.getAttempt)
router.patch(
  '/attempts/:attemptId/answers',
  validateBody(saveAnswersSchema),
  ctrl.saveAnswers
)
router.post(
  '/attempts/:attemptId/submit',
  validateBody(submitAttemptSchema),
  ctrl.submitAttempt
)

router.get('/grading/queue', canManage, ctrl.listPendingGrading)
router.get('/grading/attempts/:attemptId', canManage, ctrl.getAttemptForGrading)
router.patch(
  '/grading/attempts/:attemptId',
  canManage,
  validateBody(manualGradeSchema),
  ctrl.applyManualGrades
)

export default router
