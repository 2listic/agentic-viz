import { MarkdownParser } from '../services/MarkdownParser.js'
import { GraphRenderer } from '../components/GraphRenderer.js'

export class UIManager {
    constructor() {
        this.parser = new MarkdownParser()
        this.renderer = new GraphRenderer('graph')
        this.currentFile = null
        this.nodes = []
        this.links = []
        
        this.initializeEventListeners()
        this.renderer.initialize()
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
        this.renderer.render(nodes, links, (event, node) => this.handleNodeClick(event, node))
        this.updateStats()
    }

    clearGraph() {
        this.nodes = []
        this.links = []
        this.currentFile = null
        this.renderer.clear()
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
}