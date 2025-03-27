import { Transform } from '../primitives/Transform';
import { Point } from '../primitives/Point';
import { Rectangle } from '../primitives/Rectangle';
import { Shape } from '../shapes/Shape';

export class SceneManager {
  private shapes: Shape[] = [];
  private transform: Transform;
  private needsRedraw: boolean = true;
  private animationFrameId: number | null = null;
  
  constructor(
    private ctx: CanvasRenderingContext2D,
    transform?: Transform
  ) {
    this.transform = transform || Transform.identity();
  }
  
  /**
   * Add a shape to the scene
   */
  addShape(shape: Shape): void {
    this.shapes.push(shape);
    this.requestRedraw();
  }
  
  /**
   * Remove a shape from the scene
   */
  removeShape(shape: Shape): boolean {
    const index = this.shapes.indexOf(shape);
    if (index >= 0) {
      this.shapes.splice(index, 1);
      this.requestRedraw();
      return true;
    }
    return false;
  }
  
  /**
   * Remove all shapes from the scene
   */
  clearShapes(): void {
    this.shapes = [];
    this.requestRedraw();
  }
  
  /**
   * Request a redraw of the scene
   */
  requestRedraw(): void {
    this.needsRedraw = true;
    
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => this.render());
    }
  }
  
  /**
   * Get the current transform
   */
  getTransform(): Transform {
    return this.transform.clone();
  }
  
  /**
   * Set the transform
   */
  setTransform(transform: Transform): void {
    this.transform = transform.clone();
    this.requestRedraw();
  }
  
  /**
   * Update the transform
   */
  updateTransform(updater: (transform: Transform) => void): void {
    updater(this.transform);
    this.requestRedraw();
  }
  
  /**
   * Find a shape that contains the given point
   */
  findShapeAt(point: Point): Shape | null {
    // Search in reverse order (top to bottom)
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];
      if (shape.containsPoint && shape.containsPoint(point)) {
        return shape;
      }
    }
    return null;
  }
  
  /**
   * Get shapes by type
   */
  getShapesByType<T extends Shape>(type: string): T[] {
    return this.shapes.filter(shape => shape.type === type) as T[];
  }
  
  /**
   * Render the scene
   */
  render(): void {
    this.animationFrameId = null;
    
    if (!this.needsRedraw) return;
    this.needsRedraw = false;
    
    const { width, height } = this.ctx.canvas;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw all shapes
    for (const shape of this.shapes) {
      shape.draw(this.ctx, this.transform);
    }
  }
  
  /**
   * Draw the grid
   */
  private drawGrid(): void {
    const { width, height } = this.ctx.canvas;
    
    // Draw grid lines
    const gridSize = 50; // World units
    const minX = Math.floor(this.transform.screenToWorld(new Point(0, 0)).x / gridSize) * gridSize;
    const minY = Math.floor(this.transform.screenToWorld(new Point(0, 0)).y / gridSize) * gridSize;
    const maxX = Math.ceil(this.transform.screenToWorld(new Point(width, 0)).x / gridSize) * gridSize;
    const maxY = Math.ceil(this.transform.screenToWorld(new Point(0, height)).y / gridSize) * gridSize;
    
    // Draw light grid
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;
    
    for (let x = minX; x <= maxX; x += gridSize) {
      const start = this.transform.worldToScreen(new Point(x, minY));
      const end = this.transform.worldToScreen(new Point(x, maxY));
      
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    }
    
    for (let y = minY; y <= maxY; y += gridSize) {
      const start = this.transform.worldToScreen(new Point(minX, y));
      const end = this.transform.worldToScreen(new Point(maxX, y));
      
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    }
    
    // Draw main axes
    this.ctx.strokeStyle = '#a0a0a0';
    this.ctx.lineWidth = 2;
    
    // X-axis
    const xAxisStart = this.transform.worldToScreen(new Point(minX, 0));
    const xAxisEnd = this.transform.worldToScreen(new Point(maxX, 0));
    this.ctx.beginPath();
    this.ctx.moveTo(xAxisStart.x, xAxisStart.y);
    this.ctx.lineTo(xAxisEnd.x, xAxisEnd.y);
    this.ctx.stroke();
    
    // Y-axis
    const yAxisStart = this.transform.worldToScreen(new Point(0, minY));
    const yAxisEnd = this.transform.worldToScreen(new Point(0, maxY));
    this.ctx.beginPath();
    this.ctx.moveTo(yAxisStart.x, yAxisStart.y);
    this.ctx.lineTo(yAxisEnd.x, yAxisEnd.y);
    this.ctx.stroke();
  }
  
  /**
   * Start the animation loop
   */
  startAnimationLoop(): void {
    this.requestRedraw();
  }
  
  /**
   * Stop the animation loop
   */
  stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
} 