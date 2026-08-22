import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import * as content from '../services/content.service.js'
import * as contentImport from '../services/content.import.js'

function param(req: TenantRequest, key: string): string {
  const v = req.params[key]
  return Array.isArray(v) ? v[0]! : v!
}

function orgId(req: TenantRequest): string {
  return req.organizationId || param(req, 'orgId')
}

export async function listCourses(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const data = await content.listCourses(orgId(req))
    return sendSuccess(res, { courses: data })
  } catch (e) {
    next(e)
  }
}

export async function createCourse(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const course = await content.createCourse(orgId(req), req.user!.id, req.body)
    return sendSuccess(res, { course }, 'Course created', 201)
  } catch (e) {
    next(e)
  }
}

export async function updateCourse(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const course = await content.updateCourse(orgId(req), param(req, 'courseId'), req.body)
    return sendSuccess(res, { course }, 'Course updated')
  } catch (e) {
    next(e)
  }
}

export async function deleteCourse(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    await content.deleteCourse(orgId(req), param(req, 'courseId'))
    return sendSuccess(res, null, 'Course archived')
  } catch (e) {
    next(e)
  }
}

export async function listBanks(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : undefined
    const data = await content.listBanks(orgId(req), courseId)
    return sendSuccess(res, { banks: data })
  } catch (e) {
    next(e)
  }
}

export async function createBank(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const bank = await content.createBank(orgId(req), req.user!.id, req.body)
    return sendSuccess(res, { bank }, 'Question bank created', 201)
  } catch (e) {
    next(e)
  }
}

export async function getBank(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const bank = await content.getBank(orgId(req), param(req, 'bankId'))
    return sendSuccess(res, { bank })
  } catch (e) {
    next(e)
  }
}

export async function updateBank(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const bank = await content.updateBank(orgId(req), param(req, 'bankId'), req.body)
    return sendSuccess(res, { bank }, 'Question bank updated')
  } catch (e) {
    next(e)
  }
}

export async function deleteBank(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    await content.deleteBank(orgId(req), param(req, 'bankId'))
    return sendSuccess(res, null, 'Question bank deleted')
  } catch (e) {
    next(e)
  }
}

export async function listQuestions(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const data = await content.listQuestions(orgId(req), param(req, 'bankId'))
    return sendSuccess(res, { questions: data })
  } catch (e) {
    next(e)
  }
}

export async function importQuestions(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const result = await contentImport.importQuestions(
      orgId(req),
      param(req, 'bankId'),
      req.user!.id,
      req.body.questions || []
    )
    return sendSuccess(res, result, 'Import completed', 201)
  } catch (e) {
    next(e)
  }
}

export async function createQuestion(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const question = await content.createQuestion(
      orgId(req),
      req.user!.id,
      param(req, 'bankId'),
      req.body
    )
    return sendSuccess(res, { question }, 'Question created', 201)
  } catch (e) {
    next(e)
  }
}

export async function updateQuestion(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const question = await content.updateQuestion(
      orgId(req),
      param(req, 'questionId'),
      req.body
    )
    return sendSuccess(res, { question }, 'Question updated')
  } catch (e) {
    next(e)
  }
}

export async function deleteQuestion(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    await contentImport.assertQuestionNotInPublishedExam(
      orgId(req),
      param(req, 'questionId')
    )
    await content.deleteQuestion(orgId(req), param(req, 'questionId'))
    return sendSuccess(res, null, 'Question archived')
  } catch (e) {
    next(e)
  }
}

// ─── Subjects / Topics / Lessons ────────────────────────────────────

export async function listSubjects(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : undefined
    const subjects = await content.listSubjects(orgId(req), courseId)
    return sendSuccess(res, { subjects })
  } catch (e) {
    next(e)
  }
}

export async function createSubject(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const subject = await content.createSubject(orgId(req), req.user!.id, req.body)
    return sendSuccess(res, { subject }, 'Subject created', 201)
  } catch (e) {
    next(e)
  }
}

export async function updateSubject(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const subject = await content.updateSubject(orgId(req), param(req, 'subjectId'), req.body)
    return sendSuccess(res, { subject }, 'Subject updated')
  } catch (e) {
    next(e)
  }
}

export async function deleteSubject(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    await content.deleteSubject(orgId(req), param(req, 'subjectId'))
    return sendSuccess(res, null, 'Subject archived')
  } catch (e) {
    next(e)
  }
}

export async function listTopics(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const subjectId = typeof req.query.subjectId === 'string' ? req.query.subjectId : undefined
    const topics = await content.listTopics(orgId(req), subjectId)
    return sendSuccess(res, { topics })
  } catch (e) {
    next(e)
  }
}

export async function createTopic(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const topic = await content.createTopic(orgId(req), req.user!.id, req.body)
    return sendSuccess(res, { topic }, 'Topic created', 201)
  } catch (e) {
    next(e)
  }
}

export async function updateTopic(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const topic = await content.updateTopic(orgId(req), param(req, 'topicId'), req.body)
    return sendSuccess(res, { topic }, 'Topic updated')
  } catch (e) {
    next(e)
  }
}

export async function deleteTopic(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    await content.deleteTopic(orgId(req), param(req, 'topicId'))
    return sendSuccess(res, null, 'Topic archived')
  } catch (e) {
    next(e)
  }
}

export async function listLessons(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const topicId = typeof req.query.topicId === 'string' ? req.query.topicId : undefined
    const lessons = await content.listLessons(orgId(req), topicId)
    return sendSuccess(res, { lessons })
  } catch (e) {
    next(e)
  }
}

export async function createLesson(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const lesson = await content.createLesson(orgId(req), req.user!.id, req.body)
    return sendSuccess(res, { lesson }, 'Lesson created', 201)
  } catch (e) {
    next(e)
  }
}

export async function updateLesson(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const lesson = await content.updateLesson(orgId(req), param(req, 'lessonId'), req.body)
    return sendSuccess(res, { lesson }, 'Lesson updated')
  } catch (e) {
    next(e)
  }
}

export async function deleteLesson(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    await content.deleteLesson(orgId(req), param(req, 'lessonId'))
    return sendSuccess(res, null, 'Lesson archived')
  } catch (e) {
    next(e)
  }
}
