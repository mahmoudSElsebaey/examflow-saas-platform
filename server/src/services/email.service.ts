import { config } from '../config/index.js'

export type EmailPayload = {
  to: string
  subject: string
  text: string
  html?: string
}

/**
 * Email adapter — logs in development; swap for SMTP/Resend later without changing callers.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (config.isProd) {
    console.info(
      JSON.stringify({
        type: 'email',
        to: payload.to,
        subject: payload.subject,
        note: 'No provider configured — message not delivered',
      })
    )
    return
  }

  console.info('──────── Email (dev) ────────')
  console.info(`To: ${payload.to}`)
  console.info(`Subject: ${payload.subject}`)
  console.info(payload.text)
  console.info('─────────────────────────────')
}

export function verificationEmail(to: string, token: string): EmailPayload {
  const link = `${config.clientUrl}/verify-email?token=${encodeURIComponent(token)}`
  return {
    to,
    subject: 'Verify your ExamFlow email',
    text: `Welcome to ExamFlow.\n\nVerify your email:\n${link}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome to ExamFlow.</p><p><a href="${link}">Verify your email</a></p><p>This link expires in 24 hours.</p>`,
  }
}

export function passwordResetEmail(to: string, token: string): EmailPayload {
  const link = `${config.clientUrl}/reset-password?token=${encodeURIComponent(token)}`
  return {
    to,
    subject: 'Reset your ExamFlow password',
    text: `Reset your password:\n${link}\n\nIf you did not request this, ignore this email.\nLink expires in 1 hour.`,
    html: `<p><a href="${link}">Reset your password</a></p><p>If you did not request this, ignore this email.</p>`,
  }
}

export function orgInviteEmail(
  to: string,
  orgName: string,
  role: string
): EmailPayload {
  const link = `${config.clientUrl}/login`
  return {
    to,
    subject: `You were added to ${orgName} on ExamFlow`,
    text: `You have been added to "${orgName}" as ${role}.\n\nSign in: ${link}`,
    html: `<p>You have been added to <strong>${orgName}</strong> as <strong>${role}</strong>.</p><p><a href="${link}">Sign in to ExamFlow</a></p>`,
  }
}
