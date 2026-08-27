/**
 * Vercel Serverless entry — exports the Express app.
 * Root Directory in Vercel project settings must be `server`.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../src/app.js'
import { connectDatabase } from '../src/config/database.js'

let dbReady: Promise<void> | null = null

function ensureDb(): Promise<void> {
  if (!dbReady) {
    dbReady = connectDatabase().catch((err) => {
      dbReady = null
      throw err
    })
  }
  return dbReady
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureDb()
  } catch (err) {
    console.error('Database connection failed:', err)
    res.status(503).json({
      success: false,
      message: 'Service unavailable: database connection failed',
    })
    return
  }

  return app(req, res)
}
