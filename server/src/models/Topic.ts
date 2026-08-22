import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface ITopic extends Document {
  organizationId: Types.ObjectId
  subjectId: Types.ObjectId
  title: string
  description?: string | null
  order: number
  isActive: boolean
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const topicSchema = new Schema<ITopic>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null, maxlength: 1000 },
    order: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

topicSchema.index({ organizationId: 1, subjectId: 1, order: 1 })

topicSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Topic: Model<ITopic> =
  mongoose.models.Topic || mongoose.model<ITopic>('Topic', topicSchema)
