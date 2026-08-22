import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export type LessonProgressStatus = 'viewed' | 'completed'

export interface ILessonProgress extends Document {
  organizationId: Types.ObjectId
  lessonId: Types.ObjectId
  userId: Types.ObjectId
  status: LessonProgressStatus
  viewedAt: Date
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
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
      enum: ['viewed', 'completed'],
      default: 'viewed',
    },
    viewedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

lessonProgressSchema.index({ organizationId: 1, userId: 1, lessonId: 1 }, { unique: true })

lessonProgressSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const LessonProgress: Model<ILessonProgress> =
  mongoose.models.LessonProgress ||
  mongoose.model<ILessonProgress>('LessonProgress', lessonProgressSchema)
