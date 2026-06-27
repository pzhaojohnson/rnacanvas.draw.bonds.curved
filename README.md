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

var bond = CurvedBond.betweeen(base1, base2);

bond.base1 === base1; // true
bond.base2 === base2; // true

// the `static between()` method automatically assigns a UUID
bond.domNode.id.length >= 36; // true
```

### `readonly id`

The ID of a curved bond.

(Corresponds to the ID attribute of the underlying SVG path element.)

<b>As with DOM elements in general,
the ID of a curved bond shouldn't be changed after it's been set.</b>

```javascript
var drawing = new Drawing();

document.body.append(drawing.domNode);

var domNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');

domNode.id = 'id-12345';

drawing.domNode.append(domNode);

var base1 = drawing.addBase('G');
var base2 = drawing.addBase('C');

var bond = new CurvedBond(domNode, base1, base2);

bond.id; // "id-12345"
```

### `readonly base1`

Base 1 that the curved bond is attached to.

```javascript
var drawing = new Drawing();

document.body.append(drawing.domNode);

var base1 = drawing.addBase('G');
var base2 = drawing.addBase('C');

var bond = CurvedBond.between(base1, base2);

bond.base1 === base1; // true
```

### `readonly base2`

Base 2 that the curved bond is attached to.

```javascript
var drawing = new Drawing();

document.body.append(drawing.domNode);

var base1 = drawing.addBase('G');
var base2 = drawing.addBase('C');

var bond = CurvedBond.between(base1, base2);

bond.base2 === base2; // true
```
