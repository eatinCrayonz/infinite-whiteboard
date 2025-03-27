import { Point } from './Point';

export class Transform {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public scale: number = 1
  ) {}

  // Basic operations
  set(x: number = this.x, y: number = this.y, scale: number = this.scale): Transform {
    this.x = x;
    this.y = y;
    this.scale = scale;
    return this;
  }

  clone(): Transform {
    return new Transform(this.x, this.y, this.scale);
  }

  // Transform operations
  translate(point: Point): Transform {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  translateXY(x: number, y: number): Transform {
    this.x += x;
    this.y += y;
    return this;
  }

  scaleAt(scale: number, center: Point): Transform {
    // Keep track of the point under the mouse in world coordinates before scaling
    const worldPoint = this.screenToWorld(center);
    
    // Apply scaling
    this.scale *= scale;
    
    // After scaling, the worldPoint would appear at a different screen position.
    // We need to adjust the transform so that worldPoint still maps to the original center.
    const newScreenPoint = this.worldToScreen(worldPoint);
    
    // Calculate the offset and adjust the transform
    this.x += center.x - newScreenPoint.x;
    this.y += center.y - newScreenPoint.y;
    
    return this;
  }

  // Coordinate transformations
  screenToWorld(screenPoint: Point): Point {
    return new Point(
      (screenPoint.x - this.x) / this.scale,
      (screenPoint.y - this.y) / this.scale
    );
  }

  worldToScreen(worldPoint: Point): Point {
    return new Point(
      worldPoint.x * this.scale + this.x,
      worldPoint.y * this.scale + this.y
    );
  }

  // Utility methods
  equals(transform: Transform): boolean {
    return (
      this.x === transform.x &&
      this.y === transform.y &&
      this.scale === transform.scale
    );
  }

  toString(): string {
    return `Transform(x: ${this.x}, y: ${this.y}, scale: ${this.scale})`;
  }

  // Static methods
  static identity(): Transform {
    return new Transform(0, 0, 1);
  }

  static from(transform: Transform): Transform {
    return new Transform(transform.x, transform.y, transform.scale);
  }
}
