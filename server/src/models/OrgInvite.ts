import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'
import type { OrgMemberRole } from '../types/organization.js'

export interface IOrgInvite extends Document {
  organizationId: Types.ObjectId
  email: string
  role: Exclude<OrgMemberRole, 'owner'>
  token: string
  invitedBy: Types.ObjectId
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const orgInviteSchema = new Schema<IOrgInvite>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'examiner', 'student'],
      required: true,
    },
    token: { type: String, required: true, unique: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked', 'expired'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

orgInviteSchema.index({ organizationId: 1, email: 1, status: 1 })

orgInviteSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    delete ret.token
    return ret
  },
})

export const OrgInvite: Model<IOrgInvite> =
  mongoose.models.OrgInvite || mongoose.model<IOrgInvite>('OrgInvite', orgInviteSchema)
