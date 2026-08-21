import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'
import type { OrgPlan } from '../types/organization.js'

export interface IOrganization extends Document {
  name: string
  slug: string
  description?: string | null
  ownerId: Types.ObjectId
  plan: OrgPlan
  isActive: boolean
  branding: {
    logoUrl?: string | null
    primaryColor?: string | null
  }
  createdAt: Date
  updatedAt: Date
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      index: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: 500,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'professional', 'enterprise'],
      default: 'free',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    branding: {
      logoUrl: { type: String, default: null },
      primaryColor: { type: String, default: null },
    },
  },
  { timestamps: true }
)

organizationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    return ret
  },
})

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', organizationSchema)
