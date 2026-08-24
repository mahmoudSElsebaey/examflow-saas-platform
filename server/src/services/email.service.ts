import { config } from '../config/index.js'

export type EmailPayload = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const provider = config.email.provider
  const key = config.email.resendApiKey

  if (provider === 'resend' && key) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.email.from,
          to: [payload.to],
          subject: payload.subject,
          text: payload.text,
          html: payload.html || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        console.error('[email] Resend error', res.status, body)
      }
      return
    } catch (err) {
      console.error('[email] Resend request failed', err)
      return
    }
  }

  if (config.isProd && provider !== 'log') {
    console.info(
      JSON.stringify({
        type: 'email',
        to: payload.to,
        subject: payload.subject,
        note: 'Provider not fully configured — message not delivered',
      })
    )
    return
  }

  console.info('──────── Email (dev/log) ────────')
  console.info(`To: ${payload.to}`)
  console.info(`Subject: ${payload.subject}`)
  console.info(payload.text)
  console.info('───────────────────────────────')
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
  role: string,
  acceptLink?: string
): EmailPayload {
  const link = acceptLink || `${config.clientUrl}/login`
  const isPending = Boolean(acceptLink)
  return {
    to,
    subject: isPending
      ? `You're invited to ${orgName} on ExamFlow`
      : `You were added to ${orgName} on ExamFlow`,
    text: isPending
      ? `You are invited to "${orgName}" as ${role}.\n\nCreate an account or sign in with this email:\n${link}`
      : `You have been added to "${orgName}" as ${role}.\n\nSign in: ${link}`,
    html: isPending
      ? `<p>You are invited to <strong>${orgName}</strong> as <strong>${role}</strong>.</p><p><a href="${link}">Accept invite / Register</a></p>`
      : `<p>You have been added to <strong>${orgName}</strong> as <strong>${role}</strong>.</p><p><a href="${link}">Sign in to ExamFlow</a></p>`,
  }
}

export function examPublishedEmail(
  to: string,
  examTitle: string,
  orgName: string,
  orgId: string
): EmailPayload {
  const link = `${config.clientUrl}/app/organizations/${orgId}/exams`
  return {
    to,
    subject: `New exam available: ${examTitle}`,
    text: `A new exam "${examTitle}" is available in ${orgName}.\n\nOpen: ${link}`,
    html: `<p>A new exam <strong>${examTitle}</strong> is available in <strong>${orgName}</strong>.</p><p><a href="${link}">View exams</a></p>`,
  }
}

export function resultReadyEmail(
  to: string,
  examTitle: string,
  orgId: string,
  attemptId: string
): EmailPayload {
  const link = `${config.clientUrl}/app/organizations/${orgId}/attempts/${attemptId}`
  return {
    to,
    subject: `Results ready: ${examTitle}`,
    text: `Your results for "${examTitle}" are ready.\n\nView: ${link}`,
    html: `<p>Your results for <strong>${examTitle}</strong> are ready.</p><p><a href="${link}">View result</a></p>`,
  }
}

export function certificateIssuedEmail(
  to: string,
  examTitle: string,
  orgId: string,
  certId: string
): EmailPayload {
  const link = `${config.clientUrl}/app/organizations/${orgId}/certificates/${certId}`
  return {
    to,
    subject: `Certificate issued: ${examTitle}`,
    text: `You received a certificate for "${examTitle}".\n\nView: ${link}`,
    html: `<p>You received a certificate for <strong>${examTitle}</strong>.</p><p><a href="${link}">View certificate</a></p>`,
  }
}
