import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export type NotificationType =
  | 'exam_published'
  | 'result_ready'
  | 'certificate_issued'
  | 'org_invite'
  | 'grading_needed'
  | 'system'

export interface INotification extends Document {
  userId: Types.ObjectId
  organizationId?: Types.ObjectId | null
  type: NotificationType
  title: string
  body: string
  link?: string | null
  readAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    type: {
      type: String,
      enum: [
        'exam_published',
        'result_ready',
        'certificate_issued',
        'org_invite',
        'grading_needed',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 1000 },
    link: { type: String, default: null, maxlength: 500 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, createdAt: -1 })

notificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', notificationSchema)
