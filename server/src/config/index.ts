import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-me-32chars'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me-32chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  EMAIL_PROVIDER: z.enum(['log', 'resend']).default('log'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('ExamFlow <onboarding@resend.dev>'),
  BILLING_MODE: z.enum(['auto', 'mock', 'stripe']).default('auto'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PROFESSIONAL: z.string().optional(),
  STRIPE_PRICE_ENTERPRISE: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const env = parsed.data

if (env.NODE_ENV === 'production') {
  const weak = [
    'dev-access-secret-change-me-32chars',
    'dev-refresh-secret-change-me-32chars',
    'change-me-generate-with-openssl-rand-hex-32',
    'change-me-access-secret-min-32-chars',
    'change-me-refresh-secret-min-32-chars',
  ]
  if (
    !env.DATABASE_URL ||
    weak.includes(env.JWT_ACCESS_SECRET) ||
    weak.includes(env.JWT_REFRESH_SECRET) ||
    env.JWT_ACCESS_SECRET.length < 32 ||
    env.JWT_REFRESH_SECRET.length < 32
  ) {
    console.error(
      '❌ Production requires DATABASE_URL and strong JWT secrets (min 32 chars, not defaults).'
    )
    process.exit(1)
  }
}

export { env }

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  clientUrl: env.CLIENT_URL,
  corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  databaseUrl: env.DATABASE_URL,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  email: {
    provider: env.EMAIL_PROVIDER,
    resendApiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
  },
  billing: {
    mode: env.BILLING_MODE,
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    priceProfessional: env.STRIPE_PRICE_PROFESSIONAL,
    priceEnterprise: env.STRIPE_PRICE_ENTERPRISE,
  },
} as const
