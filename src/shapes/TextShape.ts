import { Point } from '../primitives/Point';
import { Transform } from '../primitives/Transform';
import { Shape } from './Shape';

export class TextShape implements Shape {
  public type = 'text';
  public color: string;
  public fontSize: number;
  public fontFamily: string;
  public backgroundColor: string;
  public borderColor: string;
  
  constructor(
    public text: string,
    public position: Point,
    options: {
      color?: string;
      fontSize?: number;
      fontFamily?: string;
      backgroundColor?: string;
      borderColor?: string;
    } = {}
  ) {
    this.color = options.color || '#000000';
    this.fontSize = options.fontSize || 16;
    this.fontFamily = options.fontFamily || 'Arial, sans-serif';
    this.backgroundColor = options.backgroundColor || 'rgba(255, 255, 255, 0.7)';
    this.borderColor = options.borderColor || '#2196F3';
  }
  
  draw(ctx: CanvasRenderingContext2D, transform: Transform): void {
    const screenPos = transform.worldToScreen(this.position);
    
    // Scale font size with zoom level for better readability
    const fontSize = Math.max(12, this.fontSize * transform.scale);
    ctx.font = `${fontSize}px ${this.fontFamily}`;
    
    // Calculate text metrics
    const metrics = ctx.measureText(this.text);
    const textHeight = fontSize;
    const textWidth = metrics.width;
    
    // Draw text background
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(
      screenPos.x - 4, 
      screenPos.y - 4, 
      textWidth + 8, 
      textHeight + 8
    );
    
    // Draw text border
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(
      screenPos.x - 4, 
      screenPos.y - 4, 
      textWidth + 8, 
      textHeight + 8
    );
    
    // Draw text
    ctx.fillStyle = this.color;
    ctx.textBaseline = 'top';
    ctx.fillText(this.text, screenPos.x, screenPos.y);
  }
  
  getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    // Estimate text size - this is an approximation since we don't have 
    // a canvas context to measure text exactly
    const estimatedWidth = this.text.length * (this.fontSize * 0.6);
    const estimatedHeight = this.fontSize;
    
    return {
      minX: this.position.x,
      minY: this.position.y,
      maxX: this.position.x + estimatedWidth,
      maxY: this.position.y + estimatedHeight
    };
  }
  
  containsPoint(point: Point): boolean {
    const bounds = this.getBounds();
    return (
      point.x >= bounds.minX &&
      point.x <= bounds.maxX &&
      point.y >= bounds.minY &&
      point.y <= bounds.maxY
    );
  }
}
