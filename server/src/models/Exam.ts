import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'
import type { ExamStatus } from '../types/exam.js'

export interface IExam extends Document {
  organizationId: Types.ObjectId
  title: string
  description?: string | null
  status: ExamStatus
  questionIds: Types.ObjectId[]
  timeLimitMinutes?: number | null
  passingScorePercent: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  maxAttempts: number
  totalPoints: number
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const examSchema = new Schema<IExam>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null, maxlength: 2000 },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    timeLimitMinutes: { type: Number, default: null, min: 1, max: 600 },
    passingScorePercent: { type: Number, default: 50, min: 0, max: 100 },
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 1, min: 1, max: 20 },
    totalPoints: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

examSchema.index({ organizationId: 1, status: 1 })

examSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Exam: Model<IExam> =
  mongoose.models.Exam || mongoose.model<IExam>('Exam', examSchema)
