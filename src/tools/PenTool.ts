import { Point } from '../primitives/Point';
import { ToolHandler } from '../managers/InputManager';
import { SceneManager } from '../managers/SceneManager';
import { LineShape } from '../shapes/LineShape';

export class PenTool implements ToolHandler {
  private currentLine: LineShape | null = null;
  private isDrawing: boolean = false;
  private pointBuffer: Point[] = [];
  private bufferTimer: number | null = null;
  private readonly bufferFlushInterval = 50; // ms
  
  constructor(
    private sceneManager: SceneManager,
    private options: {
      color?: string;
      thickness?: number;
    } = {}
  ) {}
  
  /**
   * Called when the tool is activated
   */
  onActivate(): void {
    // Reset state
    this.currentLine = null;
    this.isDrawing = false;
    this.pointBuffer = [];
    this.clearBufferTimer();
  }
  
  /**
   * Called when the tool is deactivated
   */
  onDeactivate(): void {
    this.finishCurrentLine();
    this.clearBufferTimer();
  }
  
  /**
   * Handle pointer down event
   */
  onPointerDown(point: Point, event: MouseEvent | TouchEvent): void {
    // Start a new line
    this.currentLine = new LineShape([], this.options);
    this.currentLine.addPoint(point);
    this.sceneManager.addShape(this.currentLine);
    this.isDrawing = true;
    
    // Add first point to buffer
    this.addPointToBuffer(point);
  }
  
  /**
   * Handle pointer move event
   */
  onPointerMove(point: Point, event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing || !this.currentLine) return;
    
    // Add point to buffer instead of directly to the line
    this.addPointToBuffer(point);
  }
  
  /**
   * Handle pointer up event
   */
  onPointerUp(point: Point, event: MouseEvent | TouchEvent): void {
    this.finishCurrentLine();
  }
  
  /**
   * Handle key down event
   */
  onKeyDown(event: KeyboardEvent): void {
    // Cancel drawing on escape
    if (event.key === 'Escape') {
      if (this.currentLine) {
        this.sceneManager.removeShape(this.currentLine);
        this.currentLine = null;
      }
      this.isDrawing = false;
      this.clearBufferTimer();
    }
  }
  
  /**
   * Add a point to the buffer and schedule a flush
   */
  private addPointToBuffer(point: Point): void {
    this.pointBuffer.push(point.clone());
    
    // If this is the first point in the buffer, schedule a flush
    if (this.pointBuffer.length === 1 && !this.bufferTimer) {
      this.scheduleBufferFlush();
    }
  }
  
  /**
   * Schedule a buffer flush
   */
  private scheduleBufferFlush(): void {
    this.bufferTimer = window.setTimeout(() => {
      this.flushPointBuffer();
      
      // If still drawing, schedule another flush
      if (this.isDrawing) {
        this.scheduleBufferFlush();
      }
    }, this.bufferFlushInterval);
  }
  
  /**
   * Flush points from buffer to the line
   */
  private flushPointBuffer(): void {
    if (!this.currentLine || this.pointBuffer.length === 0) {
      this.pointBuffer = [];
      return;
    }
    
    // Add points to line
    for (const point of this.pointBuffer) {
      this.currentLine.addPoint(point);
    }
    
    // Request a redraw
    this.sceneManager.requestRedraw();
    
    // Clear buffer
    this.pointBuffer = [];
  }
  
  /**
   * Finish the current line
   */
  private finishCurrentLine(): void {
    // Flush any remaining points
    this.flushPointBuffer();
    
    // Simplify the line to reduce points
    if (this.currentLine) {
      this.currentLine.simplify(1.5);
    }
    
    // End drawing
    this.isDrawing = false;
    this.currentLine = null;
    this.clearBufferTimer();
  }
  
  /**
   * Clear the buffer timer
   */
  private clearBufferTimer(): void {
    if (this.bufferTimer !== null) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
  }
} 