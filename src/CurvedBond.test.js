/**
 * @jest-environment jsdom
 */

import { CurvedBond } from './CurvedBond';

describe('`class CurvedBond`', () => {
  test('`constructor()`', () => {
    var domNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var bond = new CurvedBond(domNode, base1, base2);

    // stores DOM node reference
    expect(bond.domNode).toBe(domNode);

    // stores nucleobase references
    expect(bond.base1).toBe(base1);
    expect(bond.base2).toBe(base2);
  });
});

class NucleobaseMock {
  /**
   * Make each one unique.
   */
  id = `${Math.random()}`;
}
