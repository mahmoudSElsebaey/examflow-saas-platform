import mongoose from 'mongoose'
import { config } from './index.js'

/**
 * Connect to MongoDB. Safe for serverless (reuses open connection).
 * Does not call process.exit — throws so Vercel can return 503.
 */
export async function connectDatabase(): Promise<void> {
  if (!config.databaseUrl) {
    if (config.isDev) {
      console.warn(
        '⚠️  DATABASE_URL not set — running without database (auth endpoints will fail until connected)'
      )
      return
    }
    throw new Error('DATABASE_URL is required in production')
  }

  // Already connected or connecting
  if (mongoose.connection.readyState === 1) return
  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve())
      mongoose.connection.once('error', reject)
    })
    return
  }

  try {
    await mongoose.connect(config.databaseUrl)
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    throw err
  }
}
