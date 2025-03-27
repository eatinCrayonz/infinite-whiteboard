import { Point } from '../primitives/Point';
import { Rectangle } from '../primitives/Rectangle';
import { Transform } from '../primitives/Transform';
import { Shape } from './Shape';

export class RectangleShape implements Shape {
  public type = 'rectangle';
  public rect: Rectangle;
  public color: string;
  public thickness: number;
  public filled: boolean;
  public fillColor: string;
  
  constructor(
    rect: Rectangle,
    options: { 
      color?: string, 
      thickness?: number,
      filled?: boolean,
      fillColor?: string
    } = {}
  ) {
    this.rect = rect.clone();
    this.color = options.color || '#FF5722';
    this.thickness = options.thickness || 2;
    this.filled = options.filled || false;
    this.fillColor = options.fillColor || 'rgba(255, 87, 34, 0.2)';
  }
  
  draw(ctx: CanvasRenderingContext2D, transform: Transform): void {
    const topLeft = transform.worldToScreen(new Point(this.rect.x, this.rect.y));
    const bottomRight = transform.worldToScreen(
      new Point(this.rect.x + this.rect.width, this.rect.y + this.rect.height)
    );
    
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;
    
    // Draw fill if enabled
    if (this.filled) {
      ctx.fillStyle = this.fillColor;
      ctx.fillRect(topLeft.x, topLeft.y, width, height);
    }
    
    // Draw border
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    ctx.rect(topLeft.x, topLeft.y, width, height);
    ctx.stroke();
  }
  
  containsPoint(point: Point): boolean {
    return this.rect.containsPoint(point);
  }
  
  getBounds(): { minX: number, minY: number, maxX: number, maxY: number } {
    const minX = this.rect.x;
    const minY = this.rect.y;
    const maxX = this.rect.x + this.rect.width;
    const maxY = this.rect.y + this.rect.height;
    
    return { minX, minY, maxX, maxY };
  }
} 