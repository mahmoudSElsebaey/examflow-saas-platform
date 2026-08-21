import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface ICertificate extends Document {
  organizationId: Types.ObjectId
  examId: Types.ObjectId
  attemptId: Types.ObjectId
  userId: Types.ObjectId
  code: string
  recipientName: string
  examTitle: string
  score: number
  maxScore: number
  percent: number
  issuedAt: Date
  createdAt: Date
  updatedAt: Date
}

const certificateSchema = new Schema<ICertificate>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: 'ExamAttempt',
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    code: { type: String, required: true, unique: true, index: true },
    recipientName: { type: String, required: true, trim: true, maxlength: 200 },
    examTitle: { type: String, required: true, trim: true, maxlength: 200 },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percent: { type: Number, required: true },
    issuedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
)

certificateSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', certificateSchema)
