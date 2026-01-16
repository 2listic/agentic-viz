import express from 'express'
import { MarkdownParser } from '../services/MarkdownParser.js'

const router = express.Router()
const parser = new MarkdownParser()

router.post('/upload', async (req, res) => {
  try {
    const { content, filename, metadata } = req.body
    
    // Validation
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid markdown content',
        code: 'INVALID_CONTENT'
      })
    }
    
    if (content.length > 10 * 1024 * 1024) { // 10MB limit
      return res.status(413).json({
        error: 'Content too large (max 10MB)',
        code: 'CONTENT_TOO_LARGE'
      })
    }
    
    // Parse markdown
    const { nodes, links } = parser.parse(content)
    
    // Return processed data
    res.json({
      success: true,
      data: {
        filename: filename || 'uploaded.md',
        nodes,
        links,
        stats: {
          nodesCount: nodes.length,
          linksCount: links.length,
          linesCount: content.split('\n').length,
          wordsCount: content.split(/\s+/).length,
          charactersCount: content.length
        },
        metadata: metadata || {},
        processedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Markdown processing error:', error)
    res.status(500).json({
      error: 'Failed to process markdown content',
      code: 'PROCESSING_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Sample content endpoint for testing
router.get('/sample', (req, res) => {
  const sampleContent = `# Sample Markdown

This is a **sample** markdown file for testing the API.

## Features

- Bullet points
- *Italic text*
- \`Inline code\`

## Links

Check out [D3.js](https://d3js.org) for data visualization!

### Nested Section

This is a deeper nested section with more content.`

  const { nodes, links } = parser.parse(sampleContent)
  
  res.json({
    success: true,
    data: {
      filename: 'sample-api.md',
      nodes,
      links,
      stats: {
        nodesCount: nodes.length,
        linksCount: links.length,
        linesCount: sampleContent.split('\n').length,
        wordsCount: sampleContent.split(/\s+/).length,
        charactersCount: sampleContent.length
      },
      metadata: { source: 'api-sample' },
      processedAt: new Date().toISOString()
    }
  })
})

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    service: 'Markdown Processing API',
    version: '1.0.0',
    endpoints: {
      'POST /upload': 'Process markdown content',
      'GET /sample': 'Get sample markdown data',
      'GET /': 'API information'
    },
    examples: {
      upload: {
        method: 'POST',
        url: '/api/markdown/upload',
        body: {
          content: '# Hello World\\n\\nThis is markdown content.',
          filename: 'example.md',
          metadata: {}
        }
      }
    }
  })
})

export default router