import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'
import type { Difficulty, QuestionType } from '../types/content.js'

export interface IQuestion extends Document {
  organizationId: Types.ObjectId
  bankId: Types.ObjectId
  type: QuestionType
  stem: string
  options: { id: string; text: string }[]
  correctAnswers: string[]
  difficulty: Difficulty
  tags: string[]
  points: number
  version: number
  isActive: boolean
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const questionSchema = new Schema<IQuestion>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    bankId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionBank',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['mcq_single', 'mcq_multiple', 'true_false', 'short_answer'],
      required: true,
    },
    stem: { type: String, required: true, trim: true, maxlength: 5000 },
    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true, maxlength: 1000 },
      },
    ],
    correctAnswers: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    points: { type: Number, default: 1, min: 0, max: 100 },
    version: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

questionSchema.index({ organizationId: 1, bankId: 1 })

questionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema)
