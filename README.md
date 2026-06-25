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
var base1 = Nucleobase.create('A');
var base2 = Nucleobase.create('U');

var bond = CurvedBond.betweeen(base1, base2);

bond.base1 === base1; // true
bond.base2 === base2; // true

// the `static between()` method automatically assigns a UUID
bond.domNode.id.length >= 36; // true
```

### `readonly id`

The ID of a curved bond.

(Corresponds to the ID attribute of the underlying SVG path element.)

As with DOM elements in general,
the ID of a curved bond shouldn't be changed after it's been set.

```javascript
var domNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');

domNode.id = 'id-12345';

var base1 = Nucleobase.create('A');
var base2 = Nucleobase.create('U');

var bond = new CurvedBond(domNode, base1, base2);

bond.id; // "id-12345"
```
