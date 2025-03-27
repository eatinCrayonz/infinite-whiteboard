import { Vec } from '../primitives/Point';
import { Transform } from '../primitives/Transform';

// Basic event types
export type UiEventType = 'pointer' | 'click' | 'keyboard' | 'wheel' | 'misc';

// Event target types
export type EventTarget = 
  | { target: 'canvas' }
  | { target: 'shape'; shapeId: string };

// Event names
export type PointerEventName = 'pointer_down' | 'pointer_move' | 'pointer_up';
export type ClickEventName = 'double_click';
export type KeyboardEventName = 'key_down' | 'key_up';
export type WheelEventName = 'wheel';
export type MiscEventName = 'cancel' | 'complete' | 'interrupt' | 'tick';

export type EventName = 
  | PointerEventName 
  | ClickEventName 
  | KeyboardEventName 
  | WheelEventName
  | MiscEventName;

// Base event info
export interface BaseEventInfo {
  type: UiEventType;
  name: EventName;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

// Specific event infos
export interface PointerEventInfo extends BaseEventInfo {
  type: 'pointer';
  name: PointerEventName;
  point: Vec;
  pointerId: number;
  button: number;
  target: 'canvas' | 'shape';
  shapeId?: string;
}

export interface ClickEventInfo extends BaseEventInfo {
  type: 'click';
  name: ClickEventName;
  point: Vec;
  pointerId: number;
  button: number;
  target: 'canvas' | 'shape';
  shapeId?: string;
}

export interface KeyboardEventInfo extends BaseEventInfo {
  type: 'keyboard';
  name: KeyboardEventName;
  key: string;
  code: string;
}

export interface WheelEventInfo extends BaseEventInfo {
  type: 'wheel';
  name: WheelEventName;
  delta: Vec;
  point: Vec;
}

// Misc event infos
export interface CancelEventInfo extends BaseEventInfo {
  type: 'misc';
  name: 'cancel';
}

export interface CompleteEventInfo extends BaseEventInfo {
  type: 'misc';
  name: 'complete';
}

export interface InterruptEventInfo extends BaseEventInfo {
  type: 'misc';
  name: 'interrupt';
}

export interface TickEventInfo extends BaseEventInfo {
  type: 'misc';
  name: 'tick';
  elapsed: number;
}

// Combined event info type
export type EventInfo =
  | PointerEventInfo
  | ClickEventInfo
  | KeyboardEventInfo
  | WheelEventInfo
  | CancelEventInfo
  | CompleteEventInfo
  | InterruptEventInfo
  | TickEventInfo;

// Event handler types
export type PointerEvent = (info: PointerEventInfo) => void;
export type ClickEvent = (info: ClickEventInfo) => void;
export type KeyboardEvent = (info: KeyboardEventInfo) => void;
export type WheelEvent = (info: WheelEventInfo) => void;
export type CancelEvent = (info: CancelEventInfo) => void;
export type CompleteEvent = (info: CompleteEventInfo) => void;
export type InterruptEvent = (info: InterruptEventInfo) => void;
export type TickEvent = (info: TickEventInfo) => void;

// Combined event handler type
export type UiEvent = 
  | PointerEvent
  | ClickEvent
  | KeyboardEvent
  | WheelEvent
  | CancelEvent
  | CompleteEvent
  | InterruptEvent
  | TickEvent;

// Event handlers interface
export interface EventHandlers {
  onPointerDown?: PointerEvent;
  onPointerMove?: PointerEvent;
  onPointerUp?: PointerEvent;
  onDoubleClick?: ClickEvent;
  onKeyDown?: KeyboardEvent;
  onKeyUp?: KeyboardEvent;
  onWheel?: WheelEvent;
  onCancel?: CancelEvent;
  onComplete?: CompleteEvent;
  onInterrupt?: InterruptEvent;
  onTick?: TickEvent;
}

// Editor options
export interface EditorOptions {
  width: number;
  height: number;
  gridSize?: number;
  snapToGrid?: boolean;
  camera?: {
    isLocked?: boolean;
    panSpeed?: number;
    zoomSpeed?: number;
    zoomSteps?: number[];
    wheelBehavior?: 'zoom' | 'pan' | 'none';
  };
}

// Camera options
export interface CameraOptions {
  isLocked: boolean;
  panSpeed: number;
  zoomSpeed: number;
  zoomSteps: number[];
  wheelBehavior: 'zoom' | 'pan' | 'none';
}

// Camera constraints
export interface CameraConstraints {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  padding: Vec;
  origin: Vec;
  initialZoom: 'default' | 'fit-min' | 'fit-max' | 'fit-x' | 'fit-y';
  behavior: 'free' | 'fixed' | 'inside' | 'outside' | 'contain';
}
