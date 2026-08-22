import type { Response, NextFunction } from 'express'
import * as authService from '../services/auth.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '../validators/auth.validators.js'
import { config } from '../config/index.js'

const REFRESH_COOKIE = 'refreshToken'
const cookieOptions = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: (config.isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
}

export async function register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerUser(req.body as RegisterInput)
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions)
    return sendSuccess(
      res,
      { user: result.user, accessToken: result.accessToken },
      'Registration successful',
      201
    )
  } catch (err) {
    next(err)
  }
}

export async function login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginUser(req.body as LoginInput)
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions)
    return sendSuccess(
      res,
      { user: result.user, accessToken: result.accessToken },
      'Login successful'
    )
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token =
      (req.cookies?.[REFRESH_COOKIE] as string | undefined) ||
      (req.body?.refreshToken as string | undefined)

    if (!token) {
      return sendError(res, 'No refresh token', 401, 'NO_REFRESH_TOKEN')
    }

    const result = await authService.refreshTokens(token)
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions)
    return sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed')
  } catch (err) {
    next(err)
  }
}

export async function logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (req.user?.id) {
      await authService.logoutUser(req.user.id)
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' })
    return sendSuccess(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED')
    }
    const user = await authService.getMe(req.user.id)
    return sendSuccess(res, { user })
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body as ForgotPasswordInput
    await authService.forgotPassword(email)
    return sendSuccess(
      res,
      null,
      'If an account exists, a reset link was sent'
    )
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { token, password } = req.body as ResetPasswordInput
    await authService.resetPassword(token, password)
    return sendSuccess(res, null, 'Password updated successfully')
  } catch (err) {
    next(err)
  }
}

export async function verifyEmail(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.body as VerifyEmailInput
    const user = await authService.verifyEmail(token)
    return sendSuccess(res, { user }, 'Email verified')
  } catch (err) {
    next(err)
  }
}

export async function resendVerification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED')
    }
    await authService.resendVerification(req.user.id)
    return sendSuccess(res, null, 'Verification email sent')
  } catch (err) {
    next(err)
  }
}
