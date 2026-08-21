import app from './app.js'
import { config } from './config/index.js'

const server = app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║         ExamFlow API Server              ║
  ╠══════════════════════════════════════════╣
  ║  Environment : ${config.env.padEnd(24)}║
  ║  Port        : ${String(config.port).padEnd(24)}║
  ║  Health      : http://localhost:${config.port}/api/v1/health
  ╚══════════════════════════════════════════╝
  `)
})

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`)
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
