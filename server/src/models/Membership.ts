import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'
import type { MembershipStatus, OrgMemberRole } from '../types/organization.js'

export interface IMembership extends Document {
  organizationId: Types.ObjectId
  userId: Types.ObjectId
  role: OrgMemberRole
  status: MembershipStatus
  invitedBy?: Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const membershipSchema = new Schema<IMembership>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'teacher', 'examiner', 'student'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'suspended'],
      default: 'active',
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

membershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true })

membershipSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Membership: Model<IMembership> =
  mongoose.models.Membership ||
  mongoose.model<IMembership>('Membership', membershipSchema)
