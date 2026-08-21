import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { config } from './config/index.js'
import healthRoutes from './routes/health.routes.js'
import authRoutes from './routes/auth.routes.js'
import organizationRoutes from './routes/organization.routes.js'
import contentRoutes from './routes/content.routes.js'
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (config.isDev) {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

app.use('/api/v1/health', healthRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/organizations', organizationRoutes)
app.use('/api/v1/organizations/:orgId', contentRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
