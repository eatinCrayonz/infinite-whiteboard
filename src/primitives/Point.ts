export class Point {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}

  // Basic operations
  set(x: number = this.x, y: number = this.y): Point {
    this.x = x;
    this.y = y;
    return this;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  // Vector operations
  add(point: Point): Point {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  addXY(x: number, y: number): Point {
    this.x += x;
    this.y += y;
    return this;
  }

  sub(point: Point): Point {
    this.x -= point.x;
    this.y -= point.y;
    return this;
  }

  subXY(x: number, y: number): Point {
    this.x -= x;
    this.y -= y;
    return this;
  }

  mul(scalar: number): Point {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  div(scalar: number): Point {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  // Geometric operations
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Point {
    const len = this.length();
    if (len === 0) return this;
    return this.div(len);
  }

  distanceTo(point: Point): number {
    const dx = this.x - point.x;
    const dy = this.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  distanceToSquared(point: Point): number {
    const dx = this.x - point.x;
    const dy = this.y - point.y;
    return dx * dx + dy * dy;
  }

  // Utility methods
  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  toString(): string {
    return `Point(${this.x}, ${this.y})`;
  }

  // Static methods
  static from(point: Point): Point {
    return new Point(point.x, point.y);
  }

  static distance(a: Point, b: Point): number {
    return a.distanceTo(b);
  }

  static lerp(a: Point, b: Point, t: number): Point {
    return new Point(
      a.x + t * (b.x - a.x),
      a.y + t * (b.y - a.y)
    );
  }
}

// Export a type alias for Point to be used as a vector
export type Vec = Point;
