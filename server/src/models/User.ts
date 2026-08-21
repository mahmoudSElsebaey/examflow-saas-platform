import mongoose, { Schema, type Document, type Model } from 'mongoose'
import type { UserRole } from '../types/auth.js'

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  isEmailVerified: boolean
  emailVerificationToken?: string | null
  emailVerificationExpires?: Date | null
  passwordResetToken?: string | null
  passwordResetExpires?: Date | null
  refreshTokenHash?: string | null
  lastLoginAt?: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ['super_admin', 'org_owner', 'teacher', 'examiner', 'student'],
      default: 'student',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },
    passwordResetToken: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
    refreshTokenHash: { type: String, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: any) {
    ret.id = ret._id?.toString()
    delete ret._id
    delete ret.password
    delete ret.refreshTokenHash
    delete ret.emailVerificationToken
    delete ret.passwordResetToken
    return ret
  },
})

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema)
