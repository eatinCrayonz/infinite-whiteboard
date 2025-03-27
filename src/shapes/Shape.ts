import { Point } from '../primitives/Point';
import { Transform } from '../primitives/Transform';

export interface Shape {
  /**
   * Draw the shape on the canvas
   * @param ctx The canvas rendering context
   * @param transform The current transform to convert from world to screen coordinates
   */
  draw(ctx: CanvasRenderingContext2D, transform: Transform): void;
  
  /**
   * Check if a point is contained within this shape
   * @param point The point to check in world coordinates
   * @returns true if the point is contained in the shape
   */
  containsPoint?(point: Point): boolean;
  
  /**
   * Get a bounding box for the shape in world coordinates
   */
  getBounds?(): { minX: number, minY: number, maxX: number, maxY: number };
  
  /**
   * Type identifier for the shape
   */
  type: string;
} 