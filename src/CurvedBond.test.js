/**
 * @jest-environment jsdom
 */

import { CurvedBond } from './CurvedBond';

import { NucleobaseMock } from './NucleobaseMock';

import { D } from './D';

import { Point } from '@rnacanvas/points.oopified';

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
    expect(bond.domNode.getAttribute('fill')).toBe('none');

    var d = D.matching(bond.domNode.getAttribute('d'));

    // gives curved bonds a single quad-to segment by default
    expect(d.trailingSegments.length).toBe(1);
    expect(d.trailingSegments[0].controlPoints.length).toBe(1);
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

    bond.basePadding1.magnitude = 12;
    bond.basePadding2.magnitude = 8.55;

    // uncache base paddings
    domNode.dataset.basePadding1 = '';
    domNode.dataset.basePadding2 = '';

    var bond = new CurvedBond(domNode, base1, base2);

    // caches base paddings
    expect(JSON.parse(domNode.dataset.basePadding1).magnitude).toBeCloseTo(12);
    expect(JSON.parse(domNode.dataset.basePadding2).magnitude).toBeCloseTo(8.55);

    domNode.dataset.basePadding1 = JSON.stringify({ magnitude: 1000, direction: 0 });
    domNode.dataset.basePadding2 = JSON.stringify({ magnitude: 2000, direction: 0 });

    var bond = new CurvedBond(domNode, base1, base2);

    // doesn't overwrite previously cached base paddings
    expect(bond.basePadding1.magnitude).toBeCloseTo(1000);
    expect(bond.basePadding2.magnitude).toBeCloseTo(2000);
  });

  test('`get id()`', () => {
    var domNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    domNode.id = 'id-9819817294124';

    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var bond = new CurvedBond(domNode, base1, base2);

    expect(bond.id).toBe('id-9819817294124');
  });

  test('`get basePadding1()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var bond = CurvedBond.between(base1, base2);

    base1.centerPoint = { x: 12, y: -33 };
    base2.centerPoint = { x: 59, y: 9 };

    bond.basePadding1.magnitude = 7;
    expect(bond.basePadding1.magnitude).toBeCloseTo(7);

    // caches value
    expect(JSON.parse(bond.domNode.dataset.basePadding1).magnitude).toBeCloseTo(7);

    // repositions bond
    expect(Point.matching(base1.centerPoint).distanceTo(D.matching(bond.domNode.getAttribute('d')).startPoint)).toBeCloseTo(7);

    bond.basePadding1.direction = Math.PI / 4.5;
    expect(bond.basePadding1.direction).toBeCloseTo(Math.PI / 4.5);

    // caches value
    expect(JSON.parse(bond.domNode.dataset.basePadding1).direction).toBeCloseTo(Math.PI / 4.5);

    var d = D.matching(bond.domNode.getAttribute('d'));

    // repositions bond
    let direction = Point.matching(base1.centerPoint).directionTo(d.startPoint);
    expect(direction - Point.matching(base1.centerPoint).directionTo(base2.centerPoint)).toBeCloseTo(Math.PI / 4.5);
  });

  test('`get basePadding2()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var bond = CurvedBond.between(base1, base2);

    base1.centerPoint = { x: 22, y: -80 };
    base2.centerPoint = { x: 84, y: 12 };

    bond.basePadding2.magnitude = 5;
    expect(bond.basePadding2.magnitude).toBeCloseTo(5);

    // caches value
    expect(JSON.parse(bond.domNode.dataset.basePadding2).magnitude).toBeCloseTo(5);

    // repositions bond
    expect(Point.matching(base2.centerPoint).distanceTo(D.matching(bond.domNode.getAttribute('d')).endPoint)).toBeCloseTo(5);

    bond.basePadding2.direction = Math.PI / 3.75;
    expect(bond.basePadding2.direction).toBeCloseTo(Math.PI / 3.75);

    // caches value
    expect(JSON.parse(bond.domNode.dataset.basePadding2).direction).toBeCloseTo(Math.PI / 3.75);

    var d = D.matching(bond.domNode.getAttribute('d'));

    // repositions bond
    let direction = Point.matching(base2.centerPoint).directionTo(d.endPoint);
    expect(direction - Point.matching(base2.centerPoint).directionTo(base1.centerPoint)).toBeCloseTo(Math.PI / 3.75);
  });

  test('`drag()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    base1.centerPoint = { x: 100, y: -250.1 };
    base2.centerPoint = { x: 820, y: 340 };

    var bond = CurvedBond.between(base1, base2);

    bond.domNode.getTotalLength = () => Point.matching(base1.centerPoint).distanceTo(base2.centerPoint);

    bond.domNode.getPointAtLength = length => {
      let angle = Point.matching(base1.centerPoint).directionTo(base2.centerPoint);

      return Point.matching(base1.centerPoint).displaced({ magnitude: length, direction: angle });
    };

    var controlPoint = D.matching(bond.domNode.getAttribute('d')).trailingSegments[0].controlPoints[0];
    expect(controlPoint).toBeTruthy();

    bond.drag(3, 4);

    var d = D.matching(bond.domNode.getAttribute('d'));

    // repositions the curved bond
    expect(Point.matching(controlPoint).distanceTo(d.trailingSegments[0].controlPoints[0])).toBeCloseTo(2 * 5);

    // drag point specified
    bond.drag(5, 12, { dragPoint: { x: 820, y: 340 } });

    var d = D.matching(bond.domNode.getAttribute('d'));

    // repositioned the end point
    expect(Point.matching(base2.centerPoint).distanceTo(d.endPoint)).toBeCloseTo(13);

    // caches base paddings
    expect(JSON.parse(bond.domNode.dataset.basePadding2).magnitude).toBeCloseTo(13);

    var d = D.matching(bond.domNode.getAttribute('d'));

    // doesn't drag the curved bond if base 1 is already being dragged
    bond.drag(50, 100, { dragGroup: new Set([base1.domNode]) });

    // doesn't drag the curved bond if base 2 is already being dragged
    bond.drag(-20, 30, { dragGroup: new Set([base2.domNode]) });

    // unchanged
    expect(bond.domNode.getAttribute('d')).toBe(d.toString());

    expect(d.toString()).toBeTruthy();
  });
});

const uuidRegex = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/;
