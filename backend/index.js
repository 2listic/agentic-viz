import app from './server.js'

app.listen(process.env.PORT || 3001, () => {
  console.log(`Agentic Visualization Backend API running on port ${process.env.PORT || 3001}`)
  console.log(`Health check: http://localhost:${process.env.PORT || 3001}/health`)
  console.log(`API docs: http://localhost:${process.env.PORT || 3001}/api/markdown/`)
})