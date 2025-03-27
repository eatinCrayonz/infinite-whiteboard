import { Editor } from './Editor';
import { EventInfo, EventHandlers, EventName } from './types';

export interface StateNodeConstructor {
  new (editor: Editor, parent?: StateNode): StateNode;
  id: string;
  initial?: string;
  children?(): StateNodeConstructor[];
  isLockable: boolean;
}

export abstract class StateNode implements Partial<EventHandlers> {
  constructor(
    public editor: Editor,
    parent?: StateNode
  ) {
    const { id, children, initial, isLockable } = this.constructor as StateNodeConstructor;

    this.id = id;
    this._isActive = false;
    this._current = undefined;
    this.parent = parent ?? ({} as any);
    this.isLockable = isLockable;

    if (this.parent) {
      if (children && initial) {
        this.type = 'branch';
        this.initial = initial;
        this.children = Object.fromEntries(
          children().map((Ctor) => [Ctor.id, new Ctor(this.editor, this)])
        );
        this._current = this.children[this.initial];
      } else {
        this.type = 'leaf';
      }
    } else {
      this.type = 'root';
      if (children && initial) {
        this.initial = initial;
        this.children = Object.fromEntries(
          children().map((Ctor) => [Ctor.id, new Ctor(this.editor, this)])
        );
        this._current = this.children[this.initial];
      }
    }
  }

  static id: string;
  static initial?: string;
  static children?: () => StateNodeConstructor[];
  static isLockable = true;

  id: string;
  type: 'branch' | 'leaf' | 'root';
  shapeType?: string;
  initial?: string;
  children?: Record<string, StateNode>;
  isLockable: boolean;
  parent: StateNode;
  private _isActive: boolean;
  private _current: StateNode | undefined;

  // EventHandlers interface methods (optional implementations)
  onPointerDown?: EventHandlers['onPointerDown'];
  onPointerMove?: EventHandlers['onPointerMove'];
  onPointerUp?: EventHandlers['onPointerUp'];
  onDoubleClick?: EventHandlers['onDoubleClick'];
  onKeyDown?: EventHandlers['onKeyDown'];
  onKeyUp?: EventHandlers['onKeyUp'];
  onWheel?: EventHandlers['onWheel'];
  onCancel?: EventHandlers['onCancel'];
  onComplete?: EventHandlers['onComplete'];
  onInterrupt?: EventHandlers['onInterrupt'];
  onTick?: EventHandlers['onTick'];

  // Getters
  getPath(): string {
    const current = this.getCurrent();
    return this.id + (current ? `.${current.getPath()}` : '');
  }

  getCurrent(): StateNode | undefined {
    return this._current;
  }

  getIsActive(): boolean {
    return this._isActive;
  }

  // State transitions
  transition(id: string, info: any = {}): StateNode {
    const path = id.split('.');
    let currState = this as StateNode;

    for (let i = 0; i < path.length; i++) {
      const id = path[i];
      const prevChildState = currState.getCurrent();
      const nextChildState = currState.children?.[id];

      if (!nextChildState) {
        throw Error(`${currState.id} - no child state exists with the id ${id}.`);
      }

      if (prevChildState?.id !== nextChildState.id) {
        prevChildState?.exit(info, id);
        currState._current = nextChildState;
        nextChildState.enter(info, prevChildState?.id || 'initial');
        if (!nextChildState.getIsActive()) break;
      }

      currState = nextChildState;
    }

    return this;
  }

  // Event handling
  handleEvent(info: EventInfo): void {
    const currentActiveChild = this._current;

    // Call the event handler if it exists
    const handlerName = `on${this.capitalizeFirstLetter(info.name)}` as keyof EventHandlers;
    const handler = this[handlerName as keyof StateNode] as ((info: EventInfo) => void) | undefined;
    
    if (typeof handler === 'function') {
      handler.call(this, info);
    }

    // Forward the event to the current child if active
    if (this._isActive && currentActiveChild && currentActiveChild === this._current) {
      currentActiveChild.handleEvent(info);
    }
  }

  // Helper method to capitalize event names for handler lookup
  private capitalizeFirstLetter(str: string): string {
    // Convert event names like 'pointer_down' to 'PointerDown'
    // and 'double_click' to 'DoubleClick'
    return str.split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  // Lifecycle methods
  enter(info: any, from: string): void {
    this._isActive = true;
    this.onEnter?.(info, from);

    if (this.children && this.initial && this.getIsActive()) {
      const initial = this.children[this.initial];
      this._current = initial;
      initial.enter(info, from);
    }
  }

  exit(info: any, from: string): void {
    if (this.children && this.initial) {
      const current = this._current;
      if (current) {
        current.exit(info, from);
      }
    }

    this._isActive = false;
    this.onExit?.(info, from);
  }

  // Optional lifecycle hooks
  onEnter?(info: any, from: string): void;
  onExit?(info: any, from: string): void;
}
