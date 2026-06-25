/**
 * @jest-environment jsdom
 */

import { CurvedBond } from './CurvedBond';

describe('`class CurvedBond`', () => {
  test('`static between()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var bond = CurvedBond.between(base1, base2);

    // passes nucleobase references correctly
    expect(bond.base1).toBe(base1);
    expect(bond.base2).toBe(base2);

    // assigns a universally unique ID that begins with a letter
    expect(bond.domNode.id.startsWith('id-')).toBeTruthy();
    expect(bond.domNode.id).toMatch(uuidRegex);

    // assigns some default values (exact values are hard-coded to match `static between()` method)
    expect(bond.domNode.getAttribute('stroke')).toBe('black');
    expect(bond.domNode.getAttribute('stroke-width')).toBe('1.5');

    // explicitly assigns fill of "none"
    expect(bond.domNode.getAttribute('fill')).toBe('none')
  });

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

  test('`get id()`', () => {
    var domNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    domNode.id = 'id-9819817294124';

    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var bond = new CurvedBond(domNode, base1, base2);

    expect(bond.id).toBe('id-9819817294124');
  });
});

class NucleobaseMock {
  /**
   * Make each one unique.
   */
  id = `${Math.random()}`;
}

const uuidRegex = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/;
