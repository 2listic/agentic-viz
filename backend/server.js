import express from 'express'
import cors from 'cors'
import markdownRouter from './routes/markdown.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Routes
app.use('/api/markdown', markdownRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health endpoint hit!')
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'agentic-viz-backend',
    custom: 'THIS_IS_MY_APP'
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Agentic Visualization Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      markdown: '/api/markdown/*'
    }
  })
})

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  console.log('404 for:', req.method, req.url)
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  })
})

export default app