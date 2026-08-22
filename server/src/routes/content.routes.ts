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
  createSubjectSchema,
  updateSubjectSchema,
  createTopicSchema,
  updateTopicSchema,
  createLessonSchema,
  updateLessonSchema,
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

// Hierarchy
router.get('/subjects', ctrl.listSubjects)
router.post('/subjects', canManage, validateBody(createSubjectSchema), ctrl.createSubject)
router.patch(
  '/subjects/:subjectId',
  canManage,
  validateBody(updateSubjectSchema),
  ctrl.updateSubject
)
router.delete('/subjects/:subjectId', canManage, ctrl.deleteSubject)

router.get('/topics', ctrl.listTopics)
router.post('/topics', canManage, validateBody(createTopicSchema), ctrl.createTopic)
router.patch(
  '/topics/:topicId',
  canManage,
  validateBody(updateTopicSchema),
  ctrl.updateTopic
)
router.delete('/topics/:topicId', canManage, ctrl.deleteTopic)

router.get('/lessons', ctrl.listLessons)
router.get('/lessons/:lessonId', ctrl.getLesson)
router.post('/lessons', canManage, validateBody(createLessonSchema), ctrl.createLesson)
router.patch(
  '/lessons/:lessonId',
  canManage,
  validateBody(updateLessonSchema),
  ctrl.updateLesson
)
router.delete('/lessons/:lessonId', canManage, ctrl.deleteLesson)

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
