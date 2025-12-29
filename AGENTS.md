# AGENTS.md

## Project Overview

Agentic Visualization is a web application for graph-based visualization of markdown files. Built with vanilla JavaScript, D3.js, and modern CSS, it provides interactive node-link diagrams for document structure exploration.

## Development Commands

### Essential Commands
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

### Package Management
- **Install dependencies**: `npm install`
- **Add new dependency**: `npm install <package>`
- **Remove dependency**: `npm uninstall <package>`

### Testing
This project currently uses manual testing. No automated test framework is configured. To test:
1. Start dev server with `npm run dev`
2. Open browser to `http://localhost:5173`
3. Test file upload, graph rendering, and interactive features

## Code Style Guidelines

### JavaScript/ES6+ Standards

#### Imports and Modules
- Use ES6 import/export syntax exclusively
- Import named exports first, default exports last
- Group imports: third-party libraries → local modules
```javascript
import { marked } from 'marked'
import * as d3 from 'd3'
import { UtilityClass } from './utils/utility.js'
```

#### Class Architecture
- Use ES6 classes for main application components
- Initialize class properties in constructor
- Separate concerns with dedicated methods
- Use descriptive method names following verb-noun pattern
```javascript
class MarkdownGraphVisualizer {
    constructor() {
        this.nodes = []
        this.initializeEventListeners()
    }
    
    handleFileUpload(file) {
        // Implementation
    }
}
```

#### Naming Conventions
- **Classes**: PascalCase (`MarkdownGraphVisualizer`)
- **Methods/Functions**: camelCase (`handleFileUpload`)
- **Variables**: camelCase (`currentFile`, `markdownContent`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **DOM IDs**: kebab-case (`file-input`, `detail-panel`)
- **CSS Classes**: kebab-case (`.detail-panel`, `.graph-container`)

#### Error Handling
- Use try-catch blocks for async operations
- Provide user-friendly error messages
- Log technical errors to console
- Validate inputs before processing
```javascript
async loadSampleFile() {
    try {
        const response = await fetch('sample.md')
        if (!response.ok) throw new Error('File not found')
        // Process file
    } catch (error) {
        console.error('Error loading sample file:', error)
        alert('Unable to load sample file')
    }
}
```

#### Async/Await
- Prefer async/await over Promise chains
- Handle errors appropriately
- Use arrow functions for callbacks to maintain `this` context

### CSS Architecture

#### CSS Custom Properties
- Define design tokens in `:root` selector
- Use semantic naming conventions
- Group related properties
```css
:root {
    --primary-gradient: linear-gradient(...);
    --text-primary: #212529;
    --shadow-medium: 0 12px 40px 0 rgba(0, 0, 0, 0.12);
}
```

#### Class Naming
- Use BEM methodology for complex components
- Kebab-case for all class names
- Logical grouping with CSS custom properties

#### Responsive Design
- Mobile-first approach
- Use CSS Grid and Flexbox
- Breakpoint at 768px for tablets/mobile
- Test layouts across different screen sizes

### HTML Structure

#### Semantic Markup
- Use appropriate HTML5 semantic elements
- Maintain logical document structure
- Include proper ARIA labels for accessibility
- Use semantic IDs for JavaScript hooks

#### File Organization
- `index.html` - Main application shell
- `app.js` - Core application logic
- `styles.css` - All styling and animations

## D3.js Integration

### SVG Manipulation
- Use D3 selections for DOM manipulation
- Chain methods appropriately
- Handle data joins correctly
- Implement force simulations with proper configuration

### Performance Considerations
- Use `requestAnimationFrame` for animations
- Optimize SVG element creation
- Implement proper cleanup on component destruction
- Use event delegation for dynamic content

## File Structure Patterns

### Asset Organization
- Root contains main application files
- No complex build configuration
- Direct ES6 module imports
- Single-page application architecture

### Component Lifecycle
1. **Initialization**: Constructor sets up properties
2. **Event Binding**: Separate method for event listeners
3. **DOM Manipulation**: Methods for specific UI updates
4. **Cleanup**: Proper cleanup when needed

## Browser Compatibility

### Modern Features
- Target modern browsers (ES2020+)
- Use CSS custom properties
- Leverage CSS Grid and Flexbox
- Utilize modern JavaScript APIs

### Fallbacks
- Provide basic functionality without JavaScript
- Use progressive enhancement
- Test in target browsers before deployment

## Development Workflow

### Code Review Checklist
- [ ] Follows naming conventions
- [ ] Proper error handling implemented
- [ ] No console.log statements in production
- [ ] Responsive design considered
- [ ] Accessibility features included
- [ ] Performance optimized
- [ ] Cross-browser compatible

### Git Workflow
- Commit frequently with descriptive messages
- Use conventional commit format when possible
- Ensure all code passes basic syntax validation
- Test changes before committing

## Security Considerations

### File Handling
- Validate file types and sizes
- Sanitize user inputs
- Use secure file reading APIs
- Implement proper error boundaries

### Data Processing
- Parse markdown safely
- Escape HTML content appropriately
- Validate external links
- Implement content security policies

## Performance Optimization

### Bundle Size
- Minimize dependencies
- Use tree-shaking for unused imports
- Optimize images and assets
- Implement lazy loading where applicable

### Runtime Performance
- Optimize D3 force simulation parameters
- Use CSS transforms for animations
- Implement efficient data structures
- Minimize DOM manipulations

## Debugging Guidelines

### Console Usage
- Use appropriate log levels
- Include context in error messages
- Implement proper error boundaries
- Use browser dev tools effectively

### Common Issues
- Check D3 version compatibility
- Verify CSS custom properties support
- Test file upload functionality
- Validate SVG rendering in different browsers