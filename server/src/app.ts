import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { config } from './config/index.js'
import healthRoutes from './routes/health.routes.js'
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js'

const app = express()

// Security
app.use(helmet())
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
)

// Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Logging
if (config.isDev) {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Routes
app.use('/api/v1/health', healthRoutes)

// 404 + Error handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app
