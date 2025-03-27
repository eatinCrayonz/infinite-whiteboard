import { Point } from '../primitives/Point';
import { Transform } from '../primitives/Transform';
import { Shape } from './Shape';

export class LineShape implements Shape {
  public type = 'line';
  public color: string;
  public thickness: number;
  
  constructor(
    public points: Point[] = [],
    options: { color?: string, thickness?: number } = {}
  ) {
    this.color = options.color || '#2196F3';
    this.thickness = options.thickness || 3;
  }
  
  addPoint(point: Point): void {
    this.points.push(point.clone());
  }
  
  draw(ctx: CanvasRenderingContext2D, transform: Transform): void {
    if (this.points.length < 2) return;
    
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    
    const firstPoint = transform.worldToScreen(this.points[0]);
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < this.points.length; i++) {
      const point = transform.worldToScreen(this.points[i]);
      ctx.lineTo(point.x, point.y);
    }
    
    ctx.stroke();
  }
  
  getBounds(): { minX: number, minY: number, maxX: number, maxY: number } {
    if (this.points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    
    let minX = this.points[0].x;
    let minY = this.points[0].y;
    let maxX = this.points[0].x;
    let maxY = this.points[0].y;
    
    for (let i = 1; i < this.points.length; i++) {
      const point = this.points[i];
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return { minX, minY, maxX, maxY };
  }
  
  // Simplify the line by removing points that are too close together
  simplify(tolerance: number = 1): void {
    if (this.points.length <= 2) return;
    
    const newPoints: Point[] = [this.points[0]];
    let lastPoint = this.points[0];
    
    for (let i = 1; i < this.points.length; i++) {
      const point = this.points[i];
      if (point.distanceToSquared(lastPoint) > tolerance * tolerance) {
        newPoints.push(point);
        lastPoint = point;
      }
    }
    
    // Always keep the last point
    if (newPoints[newPoints.length - 1] !== this.points[this.points.length - 1]) {
      newPoints.push(this.points[this.points.length - 1]);
    }
    
    this.points = newPoints;
  }
} 