import { Point } from '../primitives/Point';
import { Transform } from '../primitives/Transform';
import { SceneManager } from './SceneManager';

export type ToolType = 'pen' | 'rectangle' | 'text' | 'select' | 'hand';

export interface ToolHandler {
  onActivate?(): void;
  onDeactivate?(): void;
  onPointerDown(point: Point, event: MouseEvent | TouchEvent): void;
  onPointerMove(point: Point, event: MouseEvent | TouchEvent): void;
  onPointerUp(point: Point, event: MouseEvent | TouchEvent): void;
  onKeyDown?(event: KeyboardEvent): void;
  onKeyUp?(event: KeyboardEvent): void;
}

export class InputManager {
  private element: HTMLElement;
  private sceneManager: SceneManager;
  private transform: Transform;
  
  private activeTool: ToolHandler | null = null;
  private currentToolType: ToolType = 'pen';
  private toolHandlers: Map<ToolType, ToolHandler> = new Map();
  
  private isPointerDown: boolean = false;
  private lastPointerPosition: Point | null = null;
  private isDragging: boolean = false;
  
  constructor(element: HTMLElement, sceneManager: SceneManager, transform: Transform) {
    this.element = element;
    this.sceneManager = sceneManager;
    this.transform = transform;
    
    this.setupEventListeners();
  }
  
  /**
   * Register a tool handler
   */
  registerTool(type: ToolType, handler: ToolHandler): void {
    this.toolHandlers.set(type, handler);
    
    // If this is the first tool or it's the pen tool, use it as the active tool
    if (!this.activeTool || type === 'pen') {
      this.setActiveTool(type);
    }
  }
  
  /**
   * Set the active tool
   */
  setActiveTool(type: ToolType): void {
    if (this.activeTool && this.activeTool.onDeactivate) {
      this.activeTool.onDeactivate();
    }
    
    this.currentToolType = type;
    this.activeTool = this.toolHandlers.get(type) || null;
    
    if (this.activeTool && this.activeTool.onActivate) {
      this.activeTool.onActivate();
    }
  }
  
  /**
   * Get the current active tool type
   */
  getActiveToolType(): ToolType {
    return this.currentToolType;
  }
  
  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Mouse events
    this.element.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd);
    
    // Wheel event for zooming
    this.element.addEventListener('wheel', this.handleWheel, { passive: false });
    
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Prevent context menu on right-click
    this.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  /**
   * Clean up event listeners
   */
  dispose(): void {
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    
    this.element.removeEventListener('wheel', this.handleWheel);
    
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
  
  /**
   * Handle mouse down event
   */
  private handleMouseDown = (e: MouseEvent): void => {
    e.preventDefault();
    
    this.isPointerDown = true;
    this.lastPointerPosition = new Point(e.clientX, e.clientY);
    
    const worldPoint = this.transform.screenToWorld(this.lastPointerPosition);
    
    if (e.altKey) {
      // Alt key held down - use hand tool temporarily
      this.isDragging = true;
    } else if (this.activeTool) {
      this.activeTool.onPointerDown(worldPoint, e);
    }
  };
  
  /**
   * Handle mouse move event
   */
  private handleMouseMove = (e: MouseEvent): void => {
    const currentPosition = new Point(e.clientX, e.clientY);
    const worldPoint = this.transform.screenToWorld(currentPosition);
    
    if (this.isPointerDown) {
      if (this.lastPointerPosition && e.altKey) {
        // Pan the canvas
        const dx = currentPosition.x - this.lastPointerPosition.x;
        const dy = currentPosition.y - this.lastPointerPosition.y;
        
        this.transform.translateXY(dx, dy);
        this.sceneManager.requestRedraw();
        this.isDragging = true;
      } else if (this.activeTool && !this.isDragging) {
        this.activeTool.onPointerMove(worldPoint, e);
      }
    }
    
    this.lastPointerPosition = currentPosition;
  };
  
  /**
   * Handle mouse up event
   */
  private handleMouseUp = (e: MouseEvent): void => {
    if (this.isPointerDown && this.activeTool && !this.isDragging) {
      const currentPosition = new Point(e.clientX, e.clientY);
      const worldPoint = this.transform.screenToWorld(currentPosition);
      this.activeTool.onPointerUp(worldPoint, e);
    }
    
    this.isPointerDown = false;
    this.isDragging = false;
  };
  
  /**
   * Handle touch start event
   */
  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.isPointerDown = true;
      this.lastPointerPosition = new Point(touch.clientX, touch.clientY);
      
      const worldPoint = this.transform.screenToWorld(this.lastPointerPosition);
      
      if (this.activeTool) {
        this.activeTool.onPointerDown(worldPoint, e);
      }
    }
  };
  
  /**
   * Handle touch move event
   */
  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const currentPosition = new Point(touch.clientX, touch.clientY);
      const worldPoint = this.transform.screenToWorld(currentPosition);
      
      if (this.isPointerDown && this.lastPointerPosition) {
        // For single touch, we might be drawing or panning
        if (this.activeTool && !this.isDragging) {
          this.activeTool.onPointerMove(worldPoint, e);
        }
        
        this.lastPointerPosition = currentPosition;
      }
    } else if (e.touches.length === 2) {
      // Two-finger gesture for panning
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      const currentPosition = new Point(midX, midY);
      
      if (this.lastPointerPosition) {
        // Pan the canvas based on the midpoint movement
        const dx = currentPosition.x - this.lastPointerPosition.x;
        const dy = currentPosition.y - this.lastPointerPosition.y;
        
        this.transform.translateXY(dx, dy);
        this.sceneManager.requestRedraw();
        this.isDragging = true;
      }
      
      this.lastPointerPosition = currentPosition;
    }
  };
  
  /**
   * Handle touch end event
   */
  private handleTouchEnd = (e: TouchEvent): void => {
    if (this.isPointerDown && this.activeTool && !this.isDragging && this.lastPointerPosition) {
      const worldPoint = this.transform.screenToWorld(this.lastPointerPosition);
      this.activeTool.onPointerUp(worldPoint, e);
    }
    
    this.isPointerDown = false;
    this.isDragging = false;
  };
  
  /**
   * Handle wheel event for zooming
   */
  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    
    const mousePos = new Point(e.clientX, e.clientY);
    const delta = -e.deltaY / 1000;
    const scaleFactor = Math.exp(delta);
    
    this.transform.scaleAt(scaleFactor, mousePos);
    this.sceneManager.requestRedraw();
  };
  
  /**
   * Handle key down event
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.activeTool && this.activeTool.onKeyDown) {
      this.activeTool.onKeyDown(e);
    }
    
    // Handle keyboard shortcuts
    switch (e.key) {
      case 'p':
        this.setActiveTool('pen');
        break;
      case 'r':
        this.setActiveTool('rectangle');
        break;
      case 't':
        this.setActiveTool('text');
        break;
      case 's':
        this.setActiveTool('select');
        break;
      case 'h':
        this.setActiveTool('hand');
        break;
      case 'Escape':
        // Cancel current operation
        if (this.activeTool && this.activeTool.onKeyDown) {
          this.activeTool.onKeyDown(e);
        }
        break;
    }
  };
  
  /**
   * Handle key up event
   */
  private handleKeyUp = (e: KeyboardEvent): void => {
    if (this.activeTool && this.activeTool.onKeyUp) {
      this.activeTool.onKeyUp(e);
    }
  };
} 