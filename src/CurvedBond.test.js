/**
 * @jest-environment jsdom
 */

import { CurvedBond } from './CurvedBond';

import { NucleobaseMock } from './NucleobaseMock';

import { D } from './D';

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

    base1.centerPoint = { x: 1000.1, y: -210.5 };
    base1.dispatchEvent('change');

    // listens for base 1 movement
    expect(D.matching(bond.domNode.getAttribute('d')).startPoint.x).toBeCloseTo(1000.1);
    expect(D.matching(bond.domNode.getAttribute('d')).startPoint.y).toBeCloseTo(-210.5);

    base2.centerPoint = { x: -540.2, y: 0.553 };
    base2.dispatchEvent('change');

    // listens for base 2 movement
    expect(D.matching(bond.domNode.getAttribute('d')).endPoint.x).toBeCloseTo(-540.2);
    expect(D.matching(bond.domNode.getAttribute('d')).endPoint.y).toBeCloseTo(0.553);
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

const uuidRegex = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/;
