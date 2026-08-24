import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export type ActivityAction =
  | 'member.invited'
  | 'member.role_changed'
  | 'member.removed'
  | 'member.suspended'
  | 'member.reactivated'
  | 'org.updated'
  | 'exam.published'
  | 'exam.created'

export interface IActivityLog extends Document {
  organizationId: Types.ObjectId
  actorId: Types.ObjectId
  action: ActivityAction
  entityType?: string | null
  entityId?: string | null
  summary: string
  meta?: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: { type: String, default: null },
    entityId: { type: String, default: null },
    summary: { type: String, required: true, maxlength: 500 },
    meta: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
)

activityLogSchema.index({ organizationId: 1, createdAt: -1 })

activityLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', activityLogSchema)
