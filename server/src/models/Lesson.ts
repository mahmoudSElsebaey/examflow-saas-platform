import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface ILesson extends Document {
  organizationId: Types.ObjectId
  topicId: Types.ObjectId
  title: string
  content?: string | null
  durationMinutes?: number | null
  order: number
  isActive: boolean
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const lessonSchema = new Schema<ILesson>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: null, maxlength: 50000 },
    durationMinutes: { type: Number, default: null, min: 0, max: 10080 },
    order: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

lessonSchema.index({ organizationId: 1, topicId: 1, order: 1 })

lessonSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', lessonSchema)
