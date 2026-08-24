import { Exam } from '../models/Exam.js'
import { Question } from '../models/Question.js'
import { Course } from '../models/Course.js'
import { QuestionBank } from '../models/QuestionBank.js'
import { Membership } from '../models/Membership.js'
import { User } from '../models/User.js'

export type SearchResultType = 'exam' | 'question' | 'course' | 'bank' | 'member'

export interface SearchHit {
  type: SearchResultType
  id: string
  title: string
  subtitle?: string | null
  meta?: Record<string, string | number | boolean | null>
  hrefHint?: string
}

export interface SearchResponse {
  query: string
  total: number
  hits: SearchHit[]
}

const LIMIT_PER_TYPE = 12

function escapeRegex(q: string): string {
  return q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function searchOrganization(
  orgId: string,
  rawQuery: string,
  types?: SearchResultType[]
): Promise<SearchResponse> {
  const query = (rawQuery || '').trim().slice(0, 120)
  if (query.length < 1) {
    return { query, total: 0, hits: [] }
  }

  const rx = new RegExp(escapeRegex(query), 'i')
  const want = new Set<
    SearchResultType
  >(
    types?.length
      ? types
      : ['exam', 'question', 'course', 'bank', 'member']
  )

  const hits: SearchHit[] = []

  if (want.has('exam')) {
    const exams = await Exam.find({
      organizationId: orgId,
      status: { $ne: 'archived' },
      $or: [{ title: rx }, { description: rx }],
    })
      .sort({ updatedAt: -1 })
      .limit(LIMIT_PER_TYPE)

    for (const e of exams) {
      hits.push({
        type: 'exam',
        id: e.id,
        title: e.title,
        subtitle: e.status,
        meta: {
          status: e.status,
          questionCount: (e.questionIds || []).length,
        },
        hrefHint: 'exams',
      })
    }
  }

  if (want.has('question')) {
    const questions = await Question.find({
      organizationId: orgId,
      isActive: true,
      $or: [{ stem: rx }, { tags: rx }],
    })
      .sort({ updatedAt: -1 })
      .limit(LIMIT_PER_TYPE)

    for (const q of questions) {
      hits.push({
        type: 'question',
        id: q.id,
        title: q.stem.slice(0, 160),
        subtitle: q.type,
        meta: {
          difficulty: q.difficulty,
          bankId: q.bankId.toString(),
          points: q.points,
        },
        hrefHint: 'content',
      })
    }
  }

  if (want.has('course')) {
    const courses = await Course.find({
      organizationId: orgId,
      isActive: true,
      $or: [{ title: rx }, { code: rx }, { description: rx }],
    })
      .sort({ updatedAt: -1 })
      .limit(LIMIT_PER_TYPE)

    for (const c of courses) {
      hits.push({
        type: 'course',
        id: c.id,
        title: c.title,
        subtitle: c.code || null,
        meta: { code: c.code ?? null },
        hrefHint: 'content',
      })
    }
  }

  if (want.has('bank')) {
    const banks = await QuestionBank.find({
      organizationId: orgId,
      isActive: true,
      $or: [{ title: rx }, { description: rx }],
    })
      .sort({ updatedAt: -1 })
      .limit(LIMIT_PER_TYPE)

    for (const b of banks) {
      hits.push({
        type: 'bank',
        id: b.id,
        title: b.title,
        subtitle: b.description || null,
        hrefHint: 'content',
      })
    }
  }

  if (want.has('member')) {
    const memberships = await Membership.find({
      organizationId: orgId,
      status: { $in: ['active', 'invited'] },
    }).limit(200)

    const userIds = memberships.map((m) => m.userId)
    const users = await User.find({
      _id: { $in: userIds },
      $or: [{ firstName: rx }, { lastName: rx }, { email: rx }],
    }).limit(LIMIT_PER_TYPE)

    const roleMap = new Map(
      memberships.map((m) => [m.userId.toString(), m.role])
    )

    for (const u of users) {
      hits.push({
        type: 'member',
        id: u.id,
        title: `${u.firstName} ${u.lastName}`.trim(),
        subtitle: u.email,
        meta: { role: roleMap.get(u.id) || null },
        hrefHint: 'members',
      })
    }
  }

  return { query, total: hits.length, hits }
}
