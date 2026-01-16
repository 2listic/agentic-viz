import { UIManager } from './components/UIManager.js'

class MarkdownGraphVisualizer {
    constructor() {
        this.uiManager = new UIManager()
        this.handleUrlParameters()
    }

    async handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search)
        const fileUrl = urlParams.get('file')

        if (fileUrl) {
            try {
                this.uiManager.showLoadingState()
                const response = await fetch(fileUrl)
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.status}`)
                }
                const content = await response.text()

                // Extract filename from URL
                const filename = fileUrl.split('/').pop() || 'remote-file.md'

                await this.uiManager.processContentAPI(content, filename, { source: 'url', url: fileUrl })
            } catch (error) {
                console.error('Error loading file from URL:', error)
                this.uiManager.showError(`Failed to load file from URL: ${error.message}`)
            } finally {
                this.uiManager.hideLoadingState()
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MarkdownGraphVisualizer()
})