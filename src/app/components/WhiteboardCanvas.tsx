import React, { useRef, useEffect } from 'react';
import { Editor } from '../../core/Editor';
import { Point } from '../../primitives/Point';

interface WhiteboardCanvasProps {
  width?: number;
  height?: number;
  onReady?: (editor: Editor) => void;
}

/**
 * WhiteboardCanvas component that renders the infinite canvas
 */
export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  width = 800,
  height = 600,
  onReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<Editor | null>(null);

  // Initialize the editor when the canvas is mounted
  useEffect(() => {
    if (canvasRef.current && !editorRef.current) {
      const canvas = canvasRef.current;
      
      // Create new editor instance
      const editor = new Editor(canvas, { width, height });
      editorRef.current = editor;
      
      // Notify parent component that editor is ready
      if (onReady) {
        onReady(editor);
      }
    }
    
    return () => {
      // Cleanup logic here if needed
      editorRef.current = null;
    };
  }, [width, height, onReady]);

  return (
    <div className="whiteboard-container" style={{ width, height, position: 'relative' }}>
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: 'block', touchAction: 'none' }}
      />
    </div>
  );
};

export default WhiteboardCanvas; 