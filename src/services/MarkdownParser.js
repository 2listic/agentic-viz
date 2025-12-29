import { marked } from 'marked'

export class MarkdownParser {
    constructor() {
        this.sections = new Map()
    }

    parse(content) {
        this.sections.clear()
        const nodes = []
        const links = []
        
        const lines = content.split('\n')
        const headingStack = []
        let nodeId = 0
        let currentSection = null
        let sectionContent = []
        
        lines.forEach((line, index) => {
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
            if (headingMatch) {
                const level = headingMatch[1].length
                const text = headingMatch[2].trim()
                const id = `node-${nodeId++}`
                
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
                
                nodes.push(node)
                currentSection = node
                
                while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
                    headingStack.pop()
                }
                
                if (headingStack.length > 0) {
                    links.push({
                        source: headingStack[headingStack.length - 1].id,
                        target: id,
                        type: 'hierarchy'
                    })
                }
                
                headingStack.push(node)
            } else if (currentSection) {
                sectionContent.push(line)
            }
            
            const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)
            for (const match of linkMatches) {
                const linkText = match[1]
                const linkUrl = match[2]
                
                const linkNodeId = `link-${linkUrl}`
                if (!nodes.find(n => n.id === linkNodeId)) {
                    nodes.push({
                        id: linkNodeId,
                        text: linkText,
                        url: linkUrl,
                        type: 'link'
                    })
                }
                
                if (headingStack.length > 0) {
                    links.push({
                        source: headingStack[headingStack.length - 1].id,
                        target: linkNodeId,
                        type: 'reference'
                    })
                }
            }
        })
        
        if (currentSection) {
            this.sections.set(currentSection.id, sectionContent.join('\n').trim())
        }
        
        return { nodes, links }
    }

    getSectionContent(nodeId) {
        return this.sections.get(nodeId) || ''
    }

    renderMarkdown(content) {
        return marked(content)
    }
}