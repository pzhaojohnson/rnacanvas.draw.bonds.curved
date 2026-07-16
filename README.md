# Installation

With `npm`:

```
npm install @rnacanvas/draw.bonds.curved
```

# Usage

All exports of this package can be accessed as named imports.

```javascript
// an example import
import { CurvedBond } from '@rnacanvas/draw.bonds.curved';
```

## `class CurvedBond`

A bond that can have one or more curves in it
(often used for tertiary bonds in drawings).

### `static between()`

Creates and returns a new curved bond between two bases.

```javascript
var drawing = new Drawing();

// necessary for bounding box calculations to work correctly
document.body.append(drawing.domNode);

var base1 = drawing.addBase('G');
var base2 = drawing.addBase('C');

var curvedBond = CurvedBond.betweeen(base1, base2);

curvedBond.base1 === base1; // true
curvedBond.base2 === base2; // true

// the `static between()` method automatically assigns a UUID
curvedBond.domNode.id.length >= 36; // true
```

### `readonly id`

The ID of a curved bond.

(Corresponds to the ID attribute of the underlying SVG path element.)

<b>As with DOM elements in general,
the ID of a curved bond shouldn't be changed after it's been set.</b>

```javascript
curvedBond.domNode.setAttribute('id', 'id-12345');

curvedBond.id; // "id-12345"
```

### `readonly base1`

Base 1 that the curved bond is attached to.

```javascript
var drawing = new Drawing();

document.body.append(drawing.domNode);

var base1 = drawing.addBase('G');
var base2 = drawing.addBase('C');

var curvedBond = CurvedBond.between(base1, base2);

curvedBond.base1 === base1; // true
```

### `readonly base2`

Base 2 that the curved bond is attached to.

```javascript
var drawing = new Drawing();

document.body.append(drawing.domNode);

var base1 = drawing.addBase('G');
var base2 = drawing.addBase('C');

var curvedBond = CurvedBond.between(base1, base2);

curvedBond.base2 === base2; // true
```

### `binds()`

Returns `true` if the specified base is base 1 or 2 of a curved bond.

Returns `false` otherwise.

```javascript
var drawing = new Drawing();

document.body.append(drawing.domNode);

var base1 = drawing.addBase('A');
var base2 = drawing.addBase('U');

var curvedBond = CurvedBond.between(base1, base2);

curvedBond.binds(base1); // true
curvedBond.binds(base2); // true

var base3 = drawing.addBase('A');

curvedBond.binds(base3); // false
```

### `basePadding1`

A vector that represents the padding between the start point of the curved bond
and the center point of base 1.

Modifying the properties of this vector repositions the curved bond.

<b>Note that the direction of base padding 1 is expressed relative to the direction from base 1 to base 2.</b>

```javascript
// give base padding 1 a magnitude of 10
curvedBond.basePadding1.magnitude = 10;

// angle 45 degrees away from the direction to base 2
curvedBond.basePadding1.direction = Math.PI / 4;
```

### `basePadding2`

A vector that represents the padding between the end point of the curved bond
and the center point of base 2.

Modifying the properties of this vector repositions the curved bond.

<b>Note that the direction of base padding 2 is expressed relative to the direction from base 2 to base 1.</b>

```javascript
// give base padding 2 a magnitude of 10
curvedBond.basePadding2.magnitude = 10;

// angle -45 degrees away from the direction to base 1
curvedBond.basePadding2.direction = -Math.PI / 4;
```

### `readonly length`

The length of the curved bond.

(Returns the same value as the `getTotalLength()` method of the underlying SVG path element.)

```javascript
curvedBond.length === curvedBond.domNode.getTotalLength(); // true
```

### `atLength()`

Returns the point at the specified length along a curved bond,
including the direction of the curved bond at that point.

This method is similar to the `getPointAtLength()` method of the underlying SVG path element.

```javascript
// the point at length 10 along the curved bond
// (in the direction from base 1 to base 2)
var p = curvedBond.atLength(10);

// X and Y coordinates
p.x;
p.y;

// the direction of the curved bond (in radians)
p.direction;
```

### `closestPoint()`

Returns the closest point along a curved bond to a specified point.

(The length along the curved bond that the closest point is at is also returned as the `length` property.)

```javascript
curvedBond.base1.centerPoint.x = 0;
curvedBond.base1.centerPoint.y = 0;

curvedBond.base2.centerPoint.x = 100;
curvedBond.base2.centerPoint.y = 0;

curvedBond.basePadding1.magnitude = 0;
curvedBond.basePadding2.magnitude = 0;

// make a horizontal line
curvedBond.domNode.setAttribute('d', 'M 0 0 Q 50 0 100 0');

var p = curvedBond.closestPoint({ x: 31, y: 5 });

p; // { x: 31, y: 0, length: 31 }
```

The `precision` option roughly corresponds to the margin for error in the closest point calculation.

(Higher margin for error speeds up calculation.)

```javascript
var p = curvedBond.closestPoint({ x: 31, y: 5 }, { precision: 20 });

// is within 20 of the true closest point
p; // { x: 40, y: 0, length: 40 }
```

### `readonly definingPoints`

Represents the points that define the path of a curved bond
(e.g., the starting point, control points in quad-to and cube-to segments, ending points).

Points are kept in order (corresponding to the order that they are in the path definition of a curved bond).

```javascript
var d = curvedBond.domNode.getAttribute('d');

// an example path definition
d; // "M 0 0 Q 10 20 50 100"

var points = curvedBond.definingPoints.toArray().map(p => [p.x, p.y]);

points; // [[0, 0], [10, 20], [50, 100]]

// returns the closest defining point to a given point
var p = curvedBond.definingPoints.closest({ x: 9, y: 21 });

p; // { x: 10, y: 20 }
```

### `drag()`

Drags a curved bond by the specified vector (e.g., the movement of the mouse).

```javascript
// drag by the vector (3, 4)
curvedBond.drag(3, 4);
```

Specifying the `dragPoint` gives control over which point of a curved bond gets dragged.

(The `dragPoint` represents the point at which the mouse made contact with the curved bond
when initiating the drag action, for instance.)

When specified, the closest "defining" point to the `dragPoint` is the point that gets dragged.

```javascript
// drag the start point of the curved bond
curvedBond.drag(3, 4, { dragPoint: curvedBond.atLength(0) });

// drag the end point of the curved bond
curvedBond.drag(3, 4, { dragPoint: curvedBond.atLength(bond.length) });
```

Specifying the `dragGroup` can prevent dragging from taking place
if bases 1 or 2 are already being dragged.

(The `dragGroup` represents the other selected elements that are also being dragged with a curved bond.)

```javascript
// no dragging (base 1 is already being dragged)
curvedBond.drag(3, 4, { dragGroup: new Set([curvedBond.base1.domNode]) });

// no dragging (base 2 is already being dragged)
curvedBond.drag(3, 4, { dragGroup: new Set([curvedBond.base2.domNode]) });
```

The `dragGroup` should fulfill the following `Collection` interface
(for SVG graphics elements).

```typescript
interface Collection {
  has(ele: SVGGraphicsElement): boolean;
}
```

### `remove()`

Removes the DOM node of a curved bond from whatever container node that it's in (e.g., a drawing).

```javascript
curvedBond.remove();
```

### `save()`

Returns the saved form of a curved bond,
which is a JSON-stringifiable object containing the necessary information for recreating a curved bond.

```javascript
var drawing = new Drawing();

document.body.append(drawing.domNode);

var base1 = drawing.addBase('G');
var base2 = drawing.addBase('C');

var curvedBond = CurvedBond.between(base1, base2);

var savedCurvedBond = curvedBond.save();

savedCurvedBond.id === curvedBond.id; // true

savedCurvedBond.baseID1 === curvedBase1.id; // true
savedCurvedBond.baseID2 === curvedBase2.id; // true

// can be converted to JSON
JSON.stringify(savedCurvedBond);
```

### `static recreate()`

Attempts to recreate a saved curved bond given the parent drawing that its DOM node is in.

Throws if unable to recreate a curved bond.

```javascript
var parentDrawing = new Drawing();

document.body.append(parentDrawing.domNode);

var base1 = parentDrawing.addBase('G');
var base2 = parentDrawing.addBase('C');

var curvedBond1 = CurvedBond.between(base1, base2);

var savedCurvedBond = curvedBond1.save();

var curvedBond2 = CurvedBond.recreate(savedCurvedBond, parentDrawing);

curvedBond2.domNode === curvedBond1.domNode; // true

curvedBond2.base1 === base1; // true
curvedBond2.base2 === base2; // true
```
