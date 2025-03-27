import { Point, Vec } from './primitives/Point';
import { Transform } from './primitives/Transform';
import { Rectangle } from './primitives/Rectangle';

console.log('=== Verifying Point class ===');
const p1 = new Point(10, 20);
console.log('Point(10, 20):', p1);

const p2 = new Point(5, 10);
p1.add(p2);
console.log('After adding Point(5, 10):', p1);

const distance = p1.distanceTo(p2);
console.log('Distance to Point(5, 10):', distance);

console.log('\n=== Verifying Transform class ===');
const transform = new Transform(100, 100, 2);
console.log('Transform(100, 100, 2):', transform);

const screenPoint = new Point(300, 200);
const worldPoint = transform.screenToWorld(screenPoint);
console.log('Screen point:', screenPoint);
console.log('World point:', worldPoint);
console.log('World point back to screen:', transform.worldToScreen(worldPoint));

console.log('\n=== Verifying Rectangle class ===');
const rect = new Rectangle(50, 50, 200, 100);
console.log('Rectangle:', rect);
console.log('Center:', rect.center);
console.log('Corners:', rect.corners);

const testPoint1 = new Point(100, 100);
const testPoint2 = new Point(300, 300);
console.log(`Point ${testPoint1} is inside rectangle: ${rect.contains(testPoint1)}`);
console.log(`Point ${testPoint2} is inside rectangle: ${rect.contains(testPoint2)}`);

console.log('\nVerification completed successfully!'); 