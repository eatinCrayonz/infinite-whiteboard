import { Transform } from '../primitives/Transform';
import { Point, Vec } from '../primitives/Point';
import { EditorOptions } from './types';

export class Editor {
  // Properties will be filled in later
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private transform: Transform;
  
  constructor(canvas: HTMLCanvasElement, options: EditorOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.transform = Transform.identity();
    
    // More initialization will be added later
  }
  
  // Basic coordinate conversion methods
  screenToWorld(screenPoint: Point): Point {
    return this.transform.screenToWorld(screenPoint);
  }
  
  worldToScreen(worldPoint: Point): Point {
    return this.transform.worldToScreen(worldPoint);
  }
}
