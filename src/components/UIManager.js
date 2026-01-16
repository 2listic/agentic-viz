import { MarkdownParser } from '../services/MarkdownParser.js'
import { GraphRenderer } from '../components/GraphRenderer.js'
import { GraphRenderer3D } from '../components/GraphRenderer3D.js'

export class UIManager {
    constructor() {
        this.parser = new MarkdownParser()
        this.renderer2D = new GraphRenderer('graph')
        this.renderer3D = null
        this.currentRenderer = '2D'
        this.currentFile = null
        this.nodes = []
        this.links = []
        
        this.initializeEventListeners()
        this.renderer2D.initialize()
    }

    initializeEventListeners() {
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0])
        })
        
        document.getElementById('loadSample').addEventListener('click', () => {
            this.loadSampleFile()
        })
        
        document.getElementById('clearGraph').addEventListener('click', () => {
            this.clearGraph()
        })
        
        document.getElementById('toggle3D').addEventListener('click', () => {
            this.toggle3DView()
        })
        
        document.getElementById('resetCamera').addEventListener('click', () => {
            if (this.renderer3D) {
                this.renderer3D.resetCamera()
            }
        })
        
        document.getElementById('zoomToFit').addEventListener('click', () => {
            if (this.renderer3D) {
                this.renderer3D.zoomToFit()
            }
        })
        
        document.getElementById('closeDetail').addEventListener('click', () => {
            this.hideDetailPanel()
        })
    }

    async handleFileUpload(file) {
        if (!file || !file.name.endsWith('.md')) {
            alert('Please select a markdown file (.md)')
            return
        }
        
        const content = await file.text()
        this.currentFile = file.name
        this.processContent(content)
        this.updateFileInfo(file.name, content)
    }

    async loadSampleFile() {
        try {
            const response = await fetch('sample.md')
            const content = await response.text()
            this.currentFile = 'sample.md'
            this.processContent(content)
            this.updateFileInfo('sample.md', content)
        } catch (error) {
            console.error('Error loading sample file:', error)
            alert('Error loading sample file')
        }
    }

    processContent(content) {
        const { nodes, links } = this.parser.parse(content)
        this.nodes = nodes
        this.links = links
        
        if (this.currentRenderer === '2D') {
            this.renderer2D.render(nodes, links, (event, node) => this.handleNodeClick(event, node))
        } else if (this.currentRenderer === '3D' && this.renderer3D) {
            this.renderer3D.render(nodes, links, (event, node) => this.handleNodeClick(event, node))
        }
        
        this.updateStats()
    }

    clearGraph() {
        this.nodes = []
        this.links = []
        this.currentFile = null
        
        if (this.currentRenderer === '2D') {
            this.renderer2D.clear()
        } else if (this.currentRenderer === '3D' && this.renderer3D) {
            this.renderer3D.clear()
        }
        
        this.updateFileInfo(null, null)
        this.updateStats()
    }

    updateFileInfo(filename, content) {
        const fileInfo = document.getElementById('fileInfo')
        if (filename) {
            const lines = content.split('\n').length
            const words = content.split(/\s+/).length
            fileInfo.innerHTML = `
                <p><strong>File:</strong> ${filename}</p>
                <p><strong>Lines:</strong> ${lines}</p>
                <p><strong>Words:</strong> ${words}</p>
            `
        } else {
            fileInfo.innerHTML = '<p>No file loaded</p>'
        }
    }

    updateStats() {
        const graphStats = document.getElementById('graphStats')
        graphStats.innerHTML = `
            <p>Nodes: ${this.nodes.length}</p>
            <p>Links: ${this.links.length}</p>
        `
    }

    handleNodeClick(event, node) {
        event.stopPropagation()
        this.showDetailPanel(node)
    }

    showDetailPanel(node) {
        const panel = document.getElementById('detailPanel')
        const title = document.getElementById('detailTitle')
        const meta = document.getElementById('detailMeta')
        const body = document.getElementById('detailBody')
        
        title.textContent = node.text
        
        let metaHTML = ''
        if (node.type === 'heading') {
            metaHTML = `
                <div class="meta-item">
                    <span class="meta-label">Type:</span>
                    <span class="meta-value">Heading ${node.level}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Line:</span>
                    <span class="meta-value">${node.line}</span>
                </div>
            `
        } else if (node.type === 'link') {
            metaHTML = `
                <div class="meta-item">
                    <span class="meta-label">Type:</span>
                    <span class="meta-value">Link</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">URL:</span>
                    <span class="meta-value"><a href="${node.url}" target="_blank">${node.url}</a></span>
                </div>
            `
        }
        meta.innerHTML = metaHTML
        
        let contentHTML = ''
        if (node.type === 'heading') {
            const sectionContent = this.parser.getSectionContent(node.id)
            if (sectionContent) {
                contentHTML = this.parser.renderMarkdown(sectionContent)
            }
        } else if (node.type === 'link') {
            contentHTML = `<p>This is a reference to <strong>${node.text}</strong>.</p>`
        }
        
        body.innerHTML = contentHTML || '<p>No content available for this node.</p>'
        
        panel.classList.remove('hidden')
    }

    hideDetailPanel() {
        const panel = document.getElementById('detailPanel')
        panel.classList.add('hidden')
    }

    async processContentAPI(content, filename = null, metadata = {}) {
        try {
            this.showLoadingState()

            const response = await fetch('/api/markdown/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content, filename, metadata })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'API request failed')
            }

            if (result.success) {
                this.nodes = result.data.nodes
                this.links = result.data.links
                this.currentFile = result.data.filename

                if (this.currentRenderer === '2D') {
                    this.renderer2D.render(this.nodes, this.links, (event, node) => this.handleNodeClick(event, node))
                } else if (this.currentRenderer === '3D' && this.renderer3D) {
                    this.renderer3D.render(this.nodes, this.links, (event, node) => this.handleNodeClick(event, node))
                }
                
                this.updateFileInfo(result.data.filename, content)
                this.updateStatsWithAPI(result.data.stats)

                return result.data
            }
        } catch (error) {
            console.error('API Error:', error)
            this.showError(`Failed to process via API: ${error.message}`)

            // Fallback to client-side processing
            return this.processContent(content)
        } finally {
            this.hideLoadingState()
        }
    }

    updateStatsWithAPI(stats) {
        const graphStats = document.getElementById('graphStats')
        graphStats.innerHTML = `
            <p>Nodes: ${stats.nodesCount}</p>
            <p>Links: ${stats.linksCount}</p>
        `
    }

    showLoadingState() {
        // Show loading indicator - you can add a loading spinner here if needed
        console.log('Processing content...')
    }

    hideLoadingState() {
        // Hide loading indicator
        console.log('Processing complete.')
    }

    async toggle3DView() {
        const toggleButton = document.getElementById('toggle3D')
        const graphContainer = document.getElementById('graph')
        const graph3dControls = document.getElementById('graph3dControls')
        const mainContainer = document.getElementById('graphContainer')
        
        if (this.currentRenderer === '2D') {
            // Switch to 3D
            try {
                // Clear 2D graph
                this.renderer2D.clear()
                
                // Initialize 3D renderer
                if (!this.renderer3D) {
                    this.renderer3D = new GraphRenderer3D('graph3d')
                    await this.renderer3D.initialize()
                }
                
                // Clear the container and prepare for 3D
                graphContainer.style.display = 'none'
                graph3dControls.style.display = 'flex'
                mainContainer.setAttribute('data-view', '3d')
                
                this.currentRenderer = '3D'
                toggleButton.textContent = 'Switch to 2D'
                toggleButton.classList.add('active-3d')
                
                // Re-render current data in 3D
                if (this.nodes.length > 0) {
                    this.renderer3D.render(this.nodes, this.links, (event, node) => this.handleNodeClick(event, node))
                }
            } catch (error) {
                console.error('Error switching to 3D:', error)
                alert('Error switching to 3D view. Please try again.')
            }
        } else {
            // Switch to 2D
            if (this.renderer3D) {
                this.renderer3D.destroy()
                this.renderer3D = null
            }
            
            // Recreate SVG for 2D
            graphContainer.style.display = 'block'
            graph3dControls.style.display = 'none'
            mainContainer.removeAttribute('data-view')
            await this.renderer2D.initialize()
            
            this.currentRenderer = '2D'
            toggleButton.textContent = 'Switch to 3D'
            toggleButton.classList.remove('active-3d')
            
            // Re-render current data in 2D
            if (this.nodes.length > 0) {
                this.renderer2D.render(this.nodes, this.links, (event, node) => this.handleNodeClick(event, node))
            }
        }
    }

    showError(message) {
        alert(message)
    }
}