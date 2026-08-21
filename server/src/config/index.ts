import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  // JWT secrets will be required later when auth is implemented
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  DATABASE_URL: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  clientUrl: env.CLIENT_URL,
  corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
} as const
