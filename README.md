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

// the `static between()` method creates curved bonds with UUIDs
bond.domNode.id.length >= 36; // true
```
