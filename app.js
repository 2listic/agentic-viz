import { marked } from 'marked'
import * as d3 from 'd3'

class MarkdownGraphVisualizer {
    constructor() {
        this.nodes = []
        this.links = []
        this.svg = null
        this.simulation = null
        this.currentFile = null
        this.markdownContent = null
        this.sections = new Map()
        
        this.initializeEventListeners()
        this.initializeSVG()
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
    
    initializeSVG() {
        const container = d3.select('#graph')
        const width = container.node().getBoundingClientRect().width
        const height = 600
        
        this.svg = container
            .attr('width', width)
            .attr('height', height)
            .append('g')
        
        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.attr('transform', event.transform)
            })
        
        container.call(zoom)
        
        // Initialize force simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30))
    }
    
    parseMarkdown(content) {
        this.nodes = []
        this.links = []
        this.markdownContent = content
        this.sections.clear()
        
        const lines = content.split('\n')
        const headingStack = []
        let nodeId = 0
        let currentSection = null
        let sectionContent = []
        
        lines.forEach((line, index) => {
            // Extract headings
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
            if (headingMatch) {
                const level = headingMatch[1].length
                const text = headingMatch[2].trim()
                const id = `node-${nodeId++}`
                
                // Save previous section content
                if (currentSection) {
                    this.sections.set(currentSection.id, sectionContent.join('\n').trim())
                    sectionContent = []
                }
                
                const node = {
                    id,
                    text,
                    level,
                    line: index + 1,
                    type: 'heading'
                }
                
                this.nodes.push(node)
                currentSection = node
                
                // Create hierarchical links
                while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
                    headingStack.pop()
                }
                
                if (headingStack.length > 0) {
                    this.links.push({
                        source: headingStack[headingStack.length - 1].id,
                        target: id,
                        type: 'hierarchy'
                    })
                }
                
                headingStack.push(node)
            } else if (currentSection) {
                // Add content to current section
                sectionContent.push(line)
            }
            
            // Extract links
            const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)
            for (const match of linkMatches) {
                const linkText = match[1]
                const linkUrl = match[2]
                
                // Create a node for the link if it doesn't exist
                const linkNodeId = `link-${linkUrl}`
                if (!this.nodes.find(n => n.id === linkNodeId)) {
                    this.nodes.push({
                        id: linkNodeId,
                        text: linkText,
                        url: linkUrl,
                        type: 'link'
                    })
                }
                
                // Link from current heading to this link
                if (headingStack.length > 0) {
                    this.links.push({
                        source: headingStack[headingStack.length - 1].id,
                        target: linkNodeId,
                        type: 'reference'
                    })
                }
            }
        })
        
        // Save last section content
        if (currentSection) {
            this.sections.set(currentSection.id, sectionContent.join('\n').trim())
        }
        
        return { nodes: this.nodes, links: this.links }
    }
    
    updateGraph() {
        // Clear existing elements
        this.svg.selectAll('*').remove()
        
        // Create links
        const link = this.svg.append('g')
            .selectAll('line')
            .data(this.links)
            .enter().append('line')
            .attr('class', d => `link ${d.type}`)
            .attr('stroke', d => d.type === 'hierarchy' ? '#999' : '#69b3a2')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2)
        
        // Create nodes
        const node = this.svg.append('g')
            .selectAll('g')
            .data(this.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .style('cursor', 'pointer')
            .on('click', (event, d) => this.handleNodeClick(event, d))
            .call(d3.drag()
                .on('start', (event, d) => this.dragstarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragended(event, d)))
        
        // Add circles for nodes
        node.append('circle')
            .attr('r', d => d.type === 'heading' ? 20 - d.level * 2 : 15)
            .attr('fill', d => {
                if (d.type === 'heading') {
                    const colors = ['#e74c3c', '#e67e22', '#f39c12', '#27ae60', '#3498db', '#9b59b6']
                    return colors[d.level - 1] || '#95a5a6'
                }
                return '#69b3a2'
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
        
        // Add labels
        node.append('text')
            .text(d => d.text)
            .attr('x', 0)
            .attr('y', d => d.type === 'heading' ? -25 - d.level * 2 : -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-family', 'Arial, sans-serif')
            .attr('fill', '#333')
        
        // Add tooltips
        node.append('title')
            .text(d => {
                if (d.type === 'heading') {
                    return `Heading ${d.level}: ${d.text} (Line ${d.line})`
                }
                return `Link: ${d.text} -> ${d.url}`
            })
        
        // Update simulation
        this.simulation.nodes(this.nodes)
        this.simulation.force('link').links(this.links)
        this.simulation.alpha(1).restart()
        
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y)
            
            node.attr('transform', d => `translate(${d.x},${d.y})`)
        })
        
        this.updateStats()
    }
    
    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
    }
    
    dragged(event, d) {
        d.fx = event.x
        d.fy = event.y
    }
    
    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
    }
    
    async handleFileUpload(file) {
        if (!file || !file.name.endsWith('.md')) {
            alert('Please select a markdown file (.md)')
            return
        }
        
        const content = await file.text()
        this.currentFile = file.name
        this.parseMarkdown(content)
        this.updateGraph()
        this.updateFileInfo(file.name, content)
    }
    
    async loadSampleFile() {
        try {
            const response = await fetch('sample.md')
            const content = await response.text()
            this.currentFile = 'sample.md'
            this.parseMarkdown(content)
            this.updateGraph()
            this.updateFileInfo('sample.md', content)
        } catch (error) {
            console.error('Error loading sample file:', error)
            alert('Error loading sample file')
        }
    }
    
    clearGraph() {
        this.nodes = []
        this.links = []
        this.currentFile = null
        this.svg.selectAll('*').remove()
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
        
        // Set title
        title.textContent = node.text
        
        // Set metadata
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
        
        // Set content
        let contentHTML = ''
        if (node.type === 'heading' && this.sections.has(node.id)) {
            const sectionContent = this.sections.get(node.id)
            if (sectionContent) {
                // Convert markdown to HTML
                contentHTML = marked(sectionContent)
            }
        } else if (node.type === 'link') {
            contentHTML = `<p>This is a reference to <strong>${node.text}</strong>.</p>`
        }
        
        body.innerHTML = contentHTML || '<p>No content available for this node.</p>'
        
        // Show panel
        panel.classList.remove('hidden')
    }
    
    hideDetailPanel() {
        const panel = document.getElementById('detailPanel')
        panel.classList.add('hidden')
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownGraphVisualizer()
})