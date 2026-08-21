import mongoose from 'mongoose'
import { config } from './index.js'

export async function connectDatabase(): Promise<void> {
  if (!config.databaseUrl) {
    if (config.isDev) {
      console.warn('⚠️  DATABASE_URL not set — running without database (auth endpoints will fail until connected)')
      return
    }
    throw new Error('DATABASE_URL is required in production')
  }

  try {
    await mongoose.connect(config.databaseUrl)
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  }
}
