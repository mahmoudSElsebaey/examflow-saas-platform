/**
 * Vercel Serverless entry — exports the Express app.
 * In Vercel project settings: Root Directory = `server`
 */
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

export default async function handler(req: any, res: any) {
  try {
    await ensureDb()
  } catch (err) {
    console.error('Database connection failed:', err)
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        success: false,
        message: 'Service unavailable: database connection failed',
      })
    )
    return
  }

  return app(req, res)
}
