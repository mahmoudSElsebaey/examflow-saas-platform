import { Question } from '../models/Question.js'
import { QuestionBank } from '../models/QuestionBank.js'
import { Exam } from '../models/Exam.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { QuestionType, Difficulty } from '../types/content.js'

export async function importQuestions(
  orgId: string,
  bankId: string,
  userId: string,
  rows: {
    type?: QuestionType
    stem: string
    options?: string[]
    correctAnswers?: string[]
    difficulty?: Difficulty
    tags?: string[]
    points?: number
  }[]
): Promise<{ created: number; errors: { row: number; message: string }[] }> {
  const bank = await QuestionBank.findOne({ _id: bankId, organizationId: orgId })
  if (!bank) throw new AppError('Bank not found', 404, 'BANK_NOT_FOUND')

  let created = 0
  const errors: { row: number; message: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    try {
      if (!row.stem?.trim()) throw new Error('stem required')
      const type = (row.type || 'mcq_single') as QuestionType
      const options = (row.options || []).map((text, idx) => ({
        id: `opt_${idx + 1}`,
        text: String(text).trim(),
      }))
      const correctAnswers = (row.correctAnswers || []).map(String)
      if (type === 'true_false' && options.length === 0) {
        options.push({ id: 'true', text: 'True' }, { id: 'false', text: 'False' })
      }
      if (
        (type === 'mcq_single' || type === 'mcq_multiple' || type === 'true_false') &&
        correctAnswers.length === 0
      ) {
        throw new Error('correctAnswers required for objective questions')
      }
      await Question.create({
        organizationId: orgId,
        bankId,
        type,
        stem: row.stem.trim(),
        options,
        correctAnswers,
        difficulty: row.difficulty || 'medium',
        tags: row.tags || [],
        points: row.points ?? 1,
        version: 1,
        isActive: true,
        createdBy: userId,
      })
      created++
    } catch (e) {
      errors.push({
        row: i + 1,
        message: e instanceof Error ? e.message : 'Invalid row',
      })
    }
  }

  if (created > 0) {
    await QuestionBank.findByIdAndUpdate(bankId, { $inc: { questionCount: created } })
  }
  return { created, errors }
}

export async function assertQuestionNotInPublishedExam(
  orgId: string,
  questionId: string
): Promise<void> {
  const used = await Exam.countDocuments({
    organizationId: orgId,
    status: 'published',
    questionIds: questionId,
  })
  if (used > 0) {
    throw new AppError(
      'Cannot delete a question used in a published exam. Deactivate instead.',
      409,
      'QUESTION_IN_USE'
    )
  }
}
