import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface ICourse extends Document {
  organizationId: Types.ObjectId
  title: string
  code?: string | null
  description?: string | null
  isActive: boolean
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const courseSchema = new Schema<ICourse>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    code: { type: String, default: null, trim: true, maxlength: 40 },
    description: { type: String, default: null, maxlength: 1000 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

courseSchema.index({ organizationId: 1, title: 1 })

courseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema)
