// Re-export the main components, hooks, and utilities
import { Point, Vec } from '../primitives/Point';
import { Transform } from '../primitives/Transform';
import { Rectangle } from '../primitives/Rectangle';
import { Editor } from '../core/Editor';

// Export primitive types
export { Point, Vec, Transform, Rectangle };

// Export core elements
export { Editor };

// Export types
export * from '../core/types';

// TODO: Add exports for application components as they are developed
// export { WhiteboardCanvas } from './components/WhiteboardCanvas';
// export { Toolbar } from './components/Toolbar';
// export { useWhiteboard } from './hooks/useWhiteboard'; 