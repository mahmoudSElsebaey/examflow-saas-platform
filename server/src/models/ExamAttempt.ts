import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'
import type { AttemptStatus } from '../types/exam.js'

export interface IAttemptAnswer {
  questionId: string
  selected: string[]
  manualScore?: number | null
  feedback?: string | null
  gradedAt?: Date | null
  gradedBy?: Types.ObjectId | null
}

export type SecurityEventType =
  | 'focus_loss'
  | 'tab_switch'
  | 'visibility_hidden'
  | 'paste'
  | 'copy'
  | 'leave_warn'

export interface ISecurityEvent {
  type: SecurityEventType
  at: Date
  meta?: string | null
}

export interface IQuestionSnapshotOption {
  id: string
  text: string
}

export interface IQuestionSnapshot {
  id: string
  type: string
  stem: string
  options: IQuestionSnapshotOption[]
  points: number
  difficulty: string
  correctAnswers: string[]
}

export interface IExamAttempt extends Document {
  examId: Types.ObjectId
  organizationId: Types.ObjectId
  userId: Types.ObjectId
  status: AttemptStatus
  startedAt: Date
  submittedAt?: Date | null
  expiresAt?: Date | null
  answers: IAttemptAnswer[]
  questionSnapshot: IQuestionSnapshot[]
  score?: number | null
  maxScore?: number | null
  percent?: number | null
  passed?: boolean | null
  needsManualGrading?: boolean
  /** Phase 07 — integrity */
  focusLossCount: number
  tabSwitchCount: number
  pasteCount: number
  securityEvents: ISecurityEvent[]
  createdAt: Date
  updatedAt: Date
}

const questionSnapshotOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
)

const questionSnapshotSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    stem: { type: String, required: true },
    options: { type: [questionSnapshotOptionSchema], default: [] },
    points: { type: Number, default: 1 },
    difficulty: { type: String, default: 'medium' },
    correctAnswers: { type: [String], default: [] },
  },
  { _id: false }
)

const examAttemptSchema = new Schema<IExamAttempt>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'timed_out'],
      default: 'in_progress',
      index: true,
    },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    answers: [
      {
        questionId: { type: String, required: true },
        selected: [{ type: String }],
        manualScore: { type: Number, default: null },
        feedback: { type: String, default: null, maxlength: 2000 },
        gradedAt: { type: Date, default: null },
        gradedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],
    questionSnapshot: { type: [questionSnapshotSchema], default: [] },
    score: { type: Number, default: null },
    maxScore: { type: Number, default: null },
    percent: { type: Number, default: null },
    passed: { type: Boolean, default: null },
    needsManualGrading: { type: Boolean, default: false, index: true },
    focusLossCount: { type: Number, default: 0, min: 0 },
    tabSwitchCount: { type: Number, default: 0, min: 0 },
    pasteCount: { type: Number, default: 0, min: 0 },
    securityEvents: [
      {
        type: {
          type: String,
          enum: ['focus_loss', 'tab_switch', 'visibility_hidden', 'paste', 'copy', 'leave_warn'],
          required: true,
        },
        at: { type: Date, required: true },
        meta: { type: String, default: null, maxlength: 200 },
      },
    ],
  },
  { timestamps: true }
)

examAttemptSchema.index({ examId: 1, userId: 1 })
examAttemptSchema.index({ organizationId: 1, needsManualGrading: 1, submittedAt: -1 })

examAttemptSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const ExamAttempt: Model<IExamAttempt> =
  mongoose.models.ExamAttempt ||
  mongoose.model<IExamAttempt>('ExamAttempt', examAttemptSchema)
