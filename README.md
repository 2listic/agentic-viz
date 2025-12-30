# Agentic Visualization

A web application for graph-based visualization of markdown files. Built with JavaScript, D3.js, and CSS, it provides interactive node-link diagrams for document structure exploration.

## Features

- Interactive graph visualization of markdown content
- Drag-and-drop file upload
- Real-time graph rendering with D3.js
- Responsive design for various screen sizes

## Prerequisites

- Node.js (version 14 or higher)
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd agentic-viz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Server

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Usage

1. Open the application in your browser.
2. Upload a markdown file using the file input.
3. The application will parse the markdown and render an interactive graph visualization.
4. Interact with the graph by dragging nodes, zooming, and exploring connections.

## Project Structure

- `index.html` - Main application entry point
- `src/main.js` - Core application logic
- `src/components/` - UI components
  - `GraphRenderer.js` - Handles graph rendering with D3.js
  - `UIManager.js` - Manages user interface interactions
- `src/services/` - Business logic services
  - `MarkdownParser.js` - Parses markdown content
- `public/` - Static assets
  - `assets/css/styles.css` - Application styles
  - `sample.md` - Sample markdown file for testing

## Dependencies

- **D3.js** (`^7.8.5`) - For graph visualization and SVG manipulation
- **Marked** (`^9.1.6`) - For markdown parsing
- **Vite** (`^6.0.0`) - Build tool and development server

## Development

### Code Style

Follow the guidelines in `AGENTS.md` for JavaScript, CSS, and HTML conventions.

### Testing

Currently uses manual testing. Start the dev server and test file upload, graph rendering, and interactive features in the browser.

## Contributing

1. Follow the code style guidelines in `AGENTS.md`.
2. Test your changes manually.
3. Ensure the application builds successfully.
