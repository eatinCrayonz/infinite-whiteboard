import { Point } from '../primitives/Point';
import { Transform } from '../primitives/Transform';
import { Rectangle } from '../primitives/Rectangle';

interface TextElement {
  text: string;
  position: Point;
  fontSize: number;
}

class WhiteboardDemo {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private transform: Transform = Transform.identity();
  private isDragging: boolean = false;
  private lastPoint: Point | null = null;
  private lines: { points: Point[] }[] = [];
  private rectangles: Rectangle[] = [];
  private textElements: TextElement[] = [];
  private currentTool: 'pen' | 'rectangle' | 'text' = 'pen';
  private startPoint: Point | null = null;
  private tempRect: Rectangle | null = null;
  private textInputElement: HTMLInputElement | null = null;

  constructor() {
    // Get canvas element
    this.canvas = document.getElementById('whiteboard') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas to fill window
    this.resizeCanvas();
    
    // Initialize transform with centered view
    this.centerView();
    
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.centerView();
    });
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Draw grid and initial content
    this.drawFrame();
  }
  
  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.drawFrame();
  }
  
  private centerView(): void {
    // Center the world origin (0,0) on the canvas
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.transform = new Transform(centerX, centerY, 1);
    
    // Redraw the canvas with centered view
    this.drawFrame();
  }
  
  private setupEventListeners(): void {
    // Mouse events for drawing
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    
    // Tool selection
    document.getElementById('pen-tool')!.addEventListener('click', () => {
      this.currentTool = 'pen';
      this.highlightSelectedTool('pen-tool');
    });
    
    document.getElementById('rectangle-tool')!.addEventListener('click', () => {
      this.currentTool = 'rectangle';
      this.highlightSelectedTool('rectangle-tool');
    });
    
    document.getElementById('text-tool')!.addEventListener('click', () => {
      this.currentTool = 'text';
      this.highlightSelectedTool('text-tool');
    });
    
    document.getElementById('reset-canvas')!.addEventListener('click', () => {
      // Clear all drawings
      this.lines = [];
      this.rectangles = [];
      this.textElements = [];
      
      // Center the view
      this.centerView();
      
      // Redraw the canvas (already called in centerView)
    });
    
    // Initialize first tool
    this.highlightSelectedTool('pen-tool');
  }
  
  private highlightSelectedTool(toolId: string): void {
    // Remove highlight from all tools
    document.querySelectorAll('.toolbar button').forEach(el => {
      (el as HTMLButtonElement).style.backgroundColor = '#4CAF50';
    });
    
    // Highlight selected tool
    const selectedTool = document.getElementById(toolId);
    if (selectedTool) {
      (selectedTool as HTMLButtonElement).style.backgroundColor = '#2E7D32';
    }
  }
  
  private handleMouseDown(e: MouseEvent): void {
    if (!this.transform) {
      console.error("Transform is not initialized");
      return;
    }

    const screenPoint = new Point(e.clientX, e.clientY);
    const worldPoint = this.transform.screenToWorld(screenPoint);
    
    if (e.altKey) {
      // Alt key pressed - start panning
      this.isDragging = true;
      this.lastPoint = screenPoint;
    } else {
      // Start drawing
      if (this.currentTool === 'pen') {
        // Create a new line
        this.lines.push({ points: [worldPoint] });
        this.isDragging = true;
      } else if (this.currentTool === 'rectangle') {
        // Start creating a rectangle
        this.startPoint = worldPoint;
        this.tempRect = new Rectangle(worldPoint.x, worldPoint.y, 0, 0);
        this.isDragging = true;
      } else if (this.currentTool === 'text') {
        // Create text input element
        this.createTextInput(screenPoint, worldPoint);
      }
    }
  }
  
  private createTextInput(screenPoint: Point, worldPoint: Point): void {
    // Remove any existing text input
    this.removeTextInput();
    
    // Create a new text input element
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.left = `${screenPoint.x}px`;
    input.style.top = `${screenPoint.y}px`;
    input.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    input.style.border = '2px solid #2196F3';
    input.style.padding = '8px';
    input.style.fontFamily = 'Arial, sans-serif';
    input.style.fontSize = '16px';
    input.style.zIndex = '1000';
    input.style.minWidth = '150px';
    input.style.outline = 'none';
    input.placeholder = 'Type text here...';
    
    // Store world position in data attribute
    input.dataset.worldX = worldPoint.x.toString();
    input.dataset.worldY = worldPoint.y.toString();
    
    // Add event listener for enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.finalizeTextInput();
      } else if (e.key === 'Escape') {
        this.removeTextInput();
      }
    });
    
    // Add event listener for blur
    input.addEventListener('blur', () => {
      setTimeout(() => this.finalizeTextInput(), 100);
    });
    
    // Add to document body
    document.body.appendChild(input);
    this.textInputElement = input;
    
    // Focus input after a small delay to ensure it's rendered
    setTimeout(() => {
      if (this.textInputElement) {
        this.textInputElement.focus();
      }
    }, 10);
  }
  
  private finalizeTextInput(): void {
    if (!this.textInputElement) return;
    
    const text = this.textInputElement.value.trim();
    if (text) {
      // Get world position from data attribute
      const worldX = parseFloat(this.textInputElement.dataset.worldX || '0');
      const worldY = parseFloat(this.textInputElement.dataset.worldY || '0');
      
      // Add text element
      this.textElements.push({
        text,
        position: new Point(worldX, worldY),
        fontSize: 16 // Base font size
      });
      
      // Redraw canvas
      this.drawFrame();
    }
    
    // Remove input element
    this.removeTextInput();
  }
  
  private removeTextInput(): void {
    if (this.textInputElement) {
      document.body.removeChild(this.textInputElement);
      this.textInputElement = null;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging || !this.transform) return;
    
    const screenPoint = new Point(e.clientX, e.clientY);
    
    if (e.altKey && this.lastPoint) {
      // Panning
      const dx = screenPoint.x - this.lastPoint.x;
      const dy = screenPoint.y - this.lastPoint.y;
      
      this.transform.translateXY(dx, dy);
      this.lastPoint = screenPoint;
      this.drawFrame();
    } else {
      // Drawing
      const worldPoint = this.transform.screenToWorld(screenPoint);
      
      if (this.currentTool === 'pen') {
        // Add point to the current line
        const currentLine = this.lines[this.lines.length - 1];
        currentLine.points.push(worldPoint);
        this.drawFrame();
      } else if (this.currentTool === 'rectangle' && this.startPoint) {
        // Update temporary rectangle
        const width = worldPoint.x - this.startPoint.x;
        const height = worldPoint.y - this.startPoint.y;
        this.tempRect = new Rectangle(
          this.startPoint.x,
          this.startPoint.y,
          width,
          height
        );
        this.drawFrame();
      }
    }
  }
  
  private handleMouseUp(): void {
    if (this.isDragging && this.currentTool === 'rectangle' && this.tempRect) {
      // Finalize rectangle
      this.rectangles.push(this.tempRect.clone());
      this.tempRect = null;
      this.startPoint = null;
    }
    
    this.isDragging = false;
    this.lastPoint = null;
  }
  
  private handleWheel(e: WheelEvent): void {
    if (!this.transform) {
      console.error("Transform is not initialized");
      return;
    }

    e.preventDefault();
    
    const screenPoint = new Point(e.clientX, e.clientY);
    const delta = -e.deltaY / 1000;
    const scale = Math.exp(delta);
    
    // Scale around the mouse point
    this.transform.scaleAt(scale, screenPoint);
    this.drawFrame();
  }
  
  private drawFrame(): void {
    const { width, height } = this.canvas;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw all shapes
    this.drawShapes();
  }
  
  private drawGrid(): void {
    if (!this.transform) {
      console.error("Transform is not initialized");
      return;
    }

    const { width, height } = this.canvas;
    
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
  
  private drawShapes(): void {
    // Draw all lines
    this.ctx.strokeStyle = '#2196F3';
    this.ctx.lineWidth = 3;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    
    for (const line of this.lines) {
      if (line.points.length < 2) continue;
      
      this.ctx.beginPath();
      
      const firstPoint = this.transform.worldToScreen(line.points[0]);
      this.ctx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 1; i < line.points.length; i++) {
        const point = this.transform.worldToScreen(line.points[i]);
        this.ctx.lineTo(point.x, point.y);
      }
      
      this.ctx.stroke();
    }
    
    // Draw rectangles
    this.ctx.strokeStyle = '#FF5722';
    this.ctx.lineWidth = 2;
    
    for (const rect of this.rectangles) {
      const topLeft = this.transform.worldToScreen(new Point(rect.x, rect.y));
      const bottomRight = this.transform.worldToScreen(new Point(rect.x + rect.width, rect.y + rect.height));
      
      this.ctx.beginPath();
      this.ctx.rect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
      this.ctx.stroke();
    }
    
    // Draw temporary rectangle if needed
    if (this.tempRect) {
      this.ctx.strokeStyle = '#FF9800';
      this.ctx.setLineDash([5, 5]);
      
      const topLeft = this.transform.worldToScreen(new Point(this.tempRect.x, this.tempRect.y));
      const bottomRight = this.transform.worldToScreen(
        new Point(this.tempRect.x + this.tempRect.width, this.tempRect.y + this.tempRect.height)
      );
      
      this.ctx.beginPath();
      this.ctx.rect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
    
    // Draw text elements
    for (const textElement of this.textElements) {
      const screenPos = this.transform.worldToScreen(textElement.position);
      
      // Scale font size with zoom level for better readability
      const fontSize = Math.max(12, textElement.fontSize * this.transform.scale);
      this.ctx.font = `${fontSize}px Arial, sans-serif`;
      
      // Calculate text metrics
      const metrics = this.ctx.measureText(textElement.text);
      const textHeight = fontSize;
      const textWidth = metrics.width;
      
      // Draw text background
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.fillRect(
        screenPos.x - 4, 
        screenPos.y - 4, 
        textWidth + 8, 
        textHeight + 8
      );
      
      // Draw text border
      this.ctx.strokeStyle = '#2196F3';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        screenPos.x - 4, 
        screenPos.y - 4, 
        textWidth + 8, 
        textHeight + 8
      );
      
      // Draw text
      this.ctx.fillStyle = '#000000';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(textElement.text, screenPos.x, screenPos.y);
    }
  }
}

// Initialize the demo when the page loads
window.addEventListener('load', () => {
  new WhiteboardDemo();
}); 