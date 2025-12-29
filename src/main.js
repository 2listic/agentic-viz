import { UIManager } from './components/UIManager.js'

class MarkdownGraphVisualizer {
    constructor() {
        this.uiManager = new UIManager()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MarkdownGraphVisualizer()
})