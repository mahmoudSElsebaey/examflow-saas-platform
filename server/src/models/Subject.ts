import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface ISubject extends Document {
  organizationId: Types.ObjectId
  courseId: Types.ObjectId
  title: string
  code?: string | null
  description?: string | null
  order: number
  isActive: boolean
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const subjectSchema = new Schema<ISubject>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    code: { type: String, default: null, trim: true, maxlength: 40 },
    description: { type: String, default: null, maxlength: 1000 },
    order: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

subjectSchema.index({ organizationId: 1, courseId: 1, order: 1 })

subjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>('Subject', subjectSchema)
