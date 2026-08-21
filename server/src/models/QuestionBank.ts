import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IQuestionBank extends Document {
  organizationId: Types.ObjectId
  courseId?: Types.ObjectId | null
  name: string
  description?: string | null
  questionCount: number
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const questionBankSchema = new Schema<IQuestionBank>(
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
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null, maxlength: 1000 },
    questionCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

questionBankSchema.index({ organizationId: 1, name: 1 })

questionBankSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const QuestionBank: Model<IQuestionBank> =
  mongoose.models.QuestionBank ||
  mongoose.model<IQuestionBank>('QuestionBank', questionBankSchema)
