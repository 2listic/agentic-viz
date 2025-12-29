import * as d3 from 'd3'

export class GraphRenderer {
    constructor(containerId) {
        this.containerId = containerId
        this.svg = null
        this.simulation = null
        this.width = 0
        this.height = 600
    }

    initialize() {
        const container = d3.select(`#${this.containerId}`)
        this.width = container.node().getBoundingClientRect().width
        
        this.svg = container
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
        
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.attr('transform', event.transform)
            })
        
        container.call(zoom)
        
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(30))
    }

    render(nodes, links, onNodeClick) {
        this.svg.selectAll('*').remove()
        
        const link = this.svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', d => `link ${d.type}`)
            .attr('stroke', d => d.type === 'hierarchy' ? '#999' : '#69b3a2')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2)
        
        const node = this.svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .style('cursor', 'pointer')
            .on('click', (event, d) => onNodeClick(event, d))
            .call(d3.drag()
                .on('start', (event, d) => this.dragstarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragended(event, d)))
        
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
        
        node.append('text')
            .text(d => d.text)
            .attr('x', 0)
            .attr('y', d => d.type === 'heading' ? -25 - d.level * 2 : -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-family', 'Arial, sans-serif')
            .attr('fill', '#333')
        
        node.append('title')
            .text(d => {
                if (d.type === 'heading') {
                    return `Heading ${d.level}: ${d.text} (Line ${d.line})`
                }
                return `Link: ${d.text} -> ${d.url}`
            })
        
        this.simulation.nodes(nodes)
        this.simulation.force('link').links(links)
        this.simulation.alpha(1).restart()
        
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y)
            
            node.attr('transform', d => `translate(${d.x},${d.y})`)
        })
    }

    clear() {
        this.svg.selectAll('*').remove()
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
}