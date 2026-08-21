import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
  toAuthUser,
} from '../utils/jwt.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { RegisterInput, LoginInput } from '../validators/auth.validators.js'
import type { AuthUser } from '../types/auth.js'

const SALT_ROUNDS = 12

export async function registerUser(input: RegisterInput): Promise<{
  user: AuthUser
  accessToken: string
  refreshToken: string
}> {
  const existing = await User.findOne({ email: input.email })
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS')
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS)
  const emailVerificationToken = generateRandomToken()

  const user = await User.create({
    email: input.email,
    password: hashedPassword,
    firstName: input.firstName,
    lastName: input.lastName,
    role: 'student',
    emailVerificationToken: hashToken(emailVerificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })

  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  user.refreshTokenHash = hashToken(refreshToken)
  await user.save()

  // TODO: send verification email with emailVerificationToken (Phase 11)

  return {
    user: toAuthUser(user),
    accessToken,
    refreshToken,
  }
}

export async function loginUser(input: LoginInput): Promise<{
  user: AuthUser
  accessToken: string
  refreshToken: string
}> {
  const user = await User.findOne({ email: input.email }).select(
    '+password +refreshTokenHash'
  )
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  const valid = await bcrypt.compare(input.password, user.password)
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  user.refreshTokenHash = hashToken(refreshToken)
  user.lastLoginAt = new Date()
  await user.save()

  return {
    user: toAuthUser(user),
    accessToken,
    refreshToken,
  }
}

export async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
}> {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
  }

  const user = await User.findById(payload.userId).select('+refreshTokenHash')
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401, 'INVALID_REFRESH_TOKEN')
  }

  if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new AppError('Refresh token revoked', 401, 'INVALID_REFRESH_TOKEN')
  }

  const newPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  const newAccessToken = signAccessToken(newPayload)
  const newRefreshToken = signRefreshToken(newPayload)

  user.refreshTokenHash = hashToken(newRefreshToken)
  await user.save()

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

export async function logoutUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null })
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await User.findById(userId)
  if (!user || !user.isActive) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }
  return toAuthUser(user)
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email })
  if (!user) return

  const token = generateRandomToken()
  user.passwordResetToken = hashToken(token)
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000)
  await user.save()

  // TODO: send password reset email with token (Phase 11)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Password reset token for ${email}: ${token}`)
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const hashed = hashToken(token)
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires')

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN')
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS)
  user.passwordResetToken = null
  user.passwordResetExpires = null
  user.refreshTokenHash = null
  await user.save()
}
