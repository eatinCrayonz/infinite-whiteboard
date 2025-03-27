# Infinite Whiteboard

A modular infinite canvas whiteboard application with pan, zoom, and drawing capabilities.

## Features

- Infinite canvas with pan and zoom
- Drawing tools (pen, rectangle)
- Vector-based primitives for precise rendering
- Modular architecture for easy extension

## Project Structure

```
infinite-whiteboard/
├── src/
│   ├── core/           # Core functionality and types
│   ├── primitives/     # Geometric primitives (Point, Transform, Rectangle)
│   ├── shapes/         # Shape definitions and rendering
│   ├── tools/          # Drawing and interaction tools
│   ├── managers/       # State management (camera, events, history)
│   ├── components/     # UI components
│   └── demo/           # Demo application
├── dist/               # Compiled output
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/infinite-whiteboard.git
cd infinite-whiteboard

# Install dependencies
npm install
```

### Development

```bash
# Build the project
npm run build

# Build and run the demo
npm run build-demo
```

After building the demo, open `dist/demo/index.html` in your browser to see the whiteboard in action.

## Demo Controls

- **Pan**: Hold Alt key and drag
- **Zoom**: Mouse wheel
- **Draw**: Select pen tool and drag
- **Rectangle**: Select rectangle tool, click and drag

## License

MIT