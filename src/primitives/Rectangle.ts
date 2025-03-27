import { Point } from './Point';

export class Rectangle {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public width: number = 0,
    public height: number = 0
  ) {}

  // Basic operations
  set(x: number = this.x, y: number = this.y, width: number = this.width, height: number = this.height): Rectangle {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  clone(): Rectangle {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  // Getters
  get minX(): number {
    return this.x;
  }

  get maxX(): number {
    return this.x + this.width;
  }

  get minY(): number {
    return this.y;
  }

  get maxY(): number {
    return this.y + this.height;
  }

  get center(): Point {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  get corners(): Point[] {
    return [
      new Point(this.minX, this.minY),
      new Point(this.maxX, this.minY),
      new Point(this.maxX, this.maxY),
      new Point(this.minX, this.maxY)
    ];
  }

  // Transformations
  translate(point: Point): Rectangle {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  translateXY(x: number, y: number): Rectangle {
    this.x += x;
    this.y += y;
    return this;
  }

  scale(scale: number): Rectangle {
    this.width *= scale;
    this.height *= scale;
    return this;
  }

  // Collision detection
  containsPoint(point: Point): boolean {
    return (
      point.x >= this.minX &&
      point.x <= this.maxX &&
      point.y >= this.minY &&
      point.y <= this.maxY
    );
  }

  // Alias for backward compatibility
  contains(point: Point): boolean {
    return this.containsPoint(point);
  }

  intersects(rectangle: Rectangle): boolean {
    return !(
      rectangle.minX > this.maxX ||
      rectangle.maxX < this.minX ||
      rectangle.minY > this.maxY ||
      rectangle.maxY < this.minY
    );
  }

  intersection(rect: Rectangle): Rectangle | null {
    const x = Math.max(this.x, rect.x);
    const y = Math.max(this.y, rect.y);
    const width = Math.min(this.x + this.width, rect.x + rect.width) - x;
    const height = Math.min(this.y + this.height, rect.y + rect.height) - y;

    if (width <= 0 || height <= 0) {
      return null;
    }

    return new Rectangle(x, y, width, height);
  }

  union(rect: Rectangle): Rectangle {
    const x = Math.min(this.x, rect.x);
    const y = Math.min(this.y, rect.y);
    const width = Math.max(this.x + this.width, rect.x + rect.width) - x;
    const height = Math.max(this.y + this.height, rect.y + rect.height) - y;

    return new Rectangle(x, y, width, height);
  }

  // Utility methods
  equals(rectangle: Rectangle): boolean {
    return (
      this.x === rectangle.x &&
      this.y === rectangle.y &&
      this.width === rectangle.width &&
      this.height === rectangle.height
    );
  }

  toString(): string {
    return `Rectangle(x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height})`;
  }

  // Static methods
  static from(rect: Rectangle): Rectangle {
    return new Rectangle(rect.x, rect.y, rect.width, rect.height);
  }

  static fromPoints(points: Point[]): Rectangle {
    if (points.length === 0) return new Rectangle();
    
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      minX = Math.min(minX, points[i].x);
      minY = Math.min(minY, points[i].y);
      maxX = Math.max(maxX, points[i].x);
      maxY = Math.max(maxY, points[i].y);
    }

    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }

  static fromTwoPoints(p1: Point, p2: Point): Rectangle {
    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const width = Math.abs(p2.x - p1.x);
    const height = Math.abs(p2.y - p1.y);

    return new Rectangle(x, y, width, height);
  }

  static fromCenter(center: Point, size: Point): Rectangle {
    return new Rectangle(
      center.x - size.x / 2,
      center.y - size.y / 2,
      size.x,
      size.y
    );
  }
}
