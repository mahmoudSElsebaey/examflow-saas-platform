import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './config/index.js'
import healthRoutes from './routes/health.routes.js'
import authRoutes from './routes/auth.routes.js'
import organizationRoutes from './routes/organization.routes.js'
import contentRoutes from './routes/content.routes.js'
import examRoutes from './routes/exam.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import certificateRoutes from './routes/certificate.routes.js'
import publicRoutes from './routes/public.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import adminRoutes from './routes/admin.routes.js'
import billingRoutes from './routes/billing.routes.js'
import plansRoutes from './routes/plans.routes.js'
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
)

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', apiLimiter)

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
app.use('/api/v1/organizations/:orgId', examRoutes)
app.use('/api/v1/organizations/:orgId', analyticsRoutes)
app.use('/api/v1/organizations/:orgId', certificateRoutes)
app.use('/api/v1/public', publicRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/organizations/:orgId', billingRoutes)
app.use('/api/v1', plansRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
