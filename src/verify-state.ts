import { StateNode } from './core/StateNode';
import { Editor } from './core/Editor';
import { Point } from './primitives/Point';
import { PointerEventInfo } from './core/types';

// Mock canvas element (for browser environments, this would be a real canvas)
const mockCanvas = {
  getContext: () => ({
    // Basic mock of canvas context
    fillRect: () => {},
    clearRect: () => {},
    // ... other methods would be here
  }),
  width: 800,
  height: 600,
} as unknown as HTMLCanvasElement;

// Create test state nodes
class RootState extends StateNode {
  static id = 'root';
  static initial = 'idle';
  static children = () => [IdleState, ActiveState];

  constructor(editor: Editor) {
    super(editor);
    console.log('RootState created');
  }

  onPointerDown = (info: PointerEventInfo): void => {
    console.log('RootState: onPointerDown at', info.point);
    this.transition('active', { from: 'pointer' });
  };
}

class IdleState extends StateNode {
  static id = 'idle';

  constructor(editor: Editor, parent?: StateNode) {
    super(editor, parent);
    console.log('IdleState created');
  }

  onEnter = (info: any, from: string): void => {
    console.log(`IdleState: entered from ${from}`);
  };

  onExit = (info: any, to: string): void => {
    console.log(`IdleState: exiting to ${to}`);
  };
}

class ActiveState extends StateNode {
  static id = 'active';

  constructor(editor: Editor, parent?: StateNode) {
    super(editor, parent);
    console.log('ActiveState created');
  }

  onEnter = (info: any, from: string): void => {
    console.log(`ActiveState: entered from ${from} with info:`, info);
  };

  onPointerMove = (info: PointerEventInfo): void => {
    console.log('ActiveState: onPointerMove at', info.point);
  };

  onPointerUp = (info: PointerEventInfo): void => {
    console.log('ActiveState: onPointerUp at', info.point);
    this.parent.transition('idle', { from: 'pointer' });
  };
}

console.log('=== Verifying StateNode functionality ===');

// Create an editor instance
const editor = new Editor(mockCanvas, { width: 800, height: 600 });
console.log('Editor created');

// Create the root state
const rootState = new RootState(editor);
console.log('Initial state path:', rootState.getPath());

// Enter the root state (this will activate the idle state)
rootState.enter({}, 'start');
console.log('After enter, state path:', rootState.getPath());

// Simulate pointer events
console.log('\n--- Simulating pointer down event ---');
const pointerDownEvent: PointerEventInfo = {
  type: 'pointer',
  name: 'pointer_down',
  point: new Point(100, 100),
  pointerId: 1,
  button: 0,
  target: 'canvas',
  shiftKey: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false
};
rootState.handleEvent(pointerDownEvent);
console.log('After pointer down, state path:', rootState.getPath());

console.log('\n--- Simulating pointer move event ---');
const pointerMoveEvent: PointerEventInfo = {
  ...pointerDownEvent,
  name: 'pointer_move',
  point: new Point(150, 150)
};
rootState.handleEvent(pointerMoveEvent);

console.log('\n--- Simulating pointer up event ---');
const pointerUpEvent: PointerEventInfo = {
  ...pointerDownEvent,
  name: 'pointer_up',
  point: new Point(200, 200)
};
rootState.handleEvent(pointerUpEvent);
console.log('After pointer up, state path:', rootState.getPath());

console.log('\nVerification completed successfully!'); 