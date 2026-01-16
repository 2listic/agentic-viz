import * as d3 from 'd3'
import ForceGraph3D from '3d-force-graph'

export class GraphRenderer3D {
    constructor(containerId) {
        this.containerId = containerId
        this.graph = null
        this.width = 0
        this.height = 600
        this.currentData = { nodes: [], links: [] }
        this.onNodeClickCallback = null
    }

    async initialize() {
        // Clean up any existing instance before creating a new one
        if (this.graph) {
            this.destroy()
        }

        // Use the parent container for 3D rendering
        const container = document.getElementById('graphContainer')
        if (!container) {
            throw new Error(`Graph container not found`)
        }

        this.width = container.clientWidth
        this.height = container.clientHeight

        // Clear any existing 3D container
        let threeDContainer = document.getElementById('graph3d')
        if (threeDContainer) {
            threeDContainer.remove()
        }

        // Create a new div for the 3D graph
        threeDContainer = document.createElement('div')
        threeDContainer.id = 'graph3d'
        threeDContainer.style.width = '100%'
        threeDContainer.style.height = '100%'
        threeDContainer.style.position = 'absolute'
        threeDContainer.style.top = '0'
        threeDContainer.style.left = '0'
        container.appendChild(threeDContainer)

        // Create the 3D force graph
        this.graph = ForceGraph3D()(threeDContainer)
            .width(this.width)
            .height(this.height)
            .backgroundColor('#ffffff')
            .showNavInfo(false)
            .nodeLabel('text')
            .nodeAutoColorBy('type')
            .linkDirectionalParticles('value')
            .linkDirectionalParticleSpeed(0.005)
            .linkDirectionalParticleWidth(1)
            .onNodeClick((node, event) => {
                if (this.onNodeClickCallback) {
                    this.onNodeClickCallback(event, node)
                }
            })
            .onNodeHover((node) => {
                container.style.cursor = node ? 'pointer' : 'default'
            })

        // Configure force simulation
        this.graph
            .d3Force('charge', d3.forceManyBody().strength(-1000))
            .d3Force('link', d3.forceLink().id(d => d.id).distance(150))
            .d3Force('center', d3.forceCenter(0, 0))
            .d3Force('collision', d3.forceCollide().radius(30))

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this))
    }

    render(nodes, links, onNodeClick) {
        this.onNodeClickCallback = onNodeClick
        
        // Transform data for 3D visualization
        const transformedNodes = nodes.map(node => ({
            id: node.id,
            text: node.text,
            type: node.type,
            level: node.level || 1,
            line: node.line,
            url: node.url,
            val: node.type === 'heading' ? (20 - node.level * 2) * 100 : 15 * 100, // Size for 3D
            color: this.getNodeColor(node)
        }))

        const transformedLinks = links.map(link => ({
            source: typeof link.source === 'object' ? link.source.id : link.source,
            target: typeof link.target === 'object' ? link.target.id : link.target,
            type: link.type,
            value: 1
        }))

        this.currentData = {
            nodes: transformedNodes,
            links: transformedLinks
        }

        if (this.graph) {
            this.graph
                .graphData(this.currentData)
                .nodeColor(node => this.getNodeColor(node))
                .nodeOpacity(0.9)
                .linkColor(link => link.type === 'hierarchy' ? '#adb5bd' : '#dee2e6')
                .linkOpacity(0.7)
        }
    }

    getNodeColor(node) {
        if (node.type === 'heading') {
            const colors = ['#e74c3c', '#e67e22', '#f39c12', '#27ae60', '#3498db', '#9b59b6']
            return colors[node.level - 1] || '#95a5a6'
        }
        return '#69b3a2'
    }

    clear() {
        if (this.graph) {
            this.graph.graphData({ nodes: [], links: [] })
        }
        this.currentData = { nodes: [], links: [] }
    }

    handleResize() {
        const container = document.getElementById(this.containerId)
        if (container && this.graph) {
            this.width = container.clientWidth
            this.height = container.clientHeight
            this.graph.width(this.width).height(this.height)
        }
    }

    // 3D-specific methods
    resetCamera() {
        if (this.graph) {
            // Reset camera to default position
            this.graph.controls().reset()
        }
    }

    zoomToFit() {
        if (this.graph) {
            this.graph.zoomToFit(400)
        }
    }

    getGraphInstance() {
        return this.graph
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize.bind(this))
        if (this.graph) {
            // Clear the graph and remove event listeners
            this.clear()
            
            // Dispose of Three.js resources properly
            if (this.graph._destructor) {
                this.graph._destructor()
            }
            
            // Remove the 3D container from DOM
            const threeDContainer = document.getElementById('graph3d')
            if (threeDContainer) {
                threeDContainer.remove()
            }
            
            this.graph = null
        }
        this.currentData = { nodes: [], links: [] }
    }
}