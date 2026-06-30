/**
 * @jest-environment jsdom
 */

import { CurvedBond } from './CurvedBond';

import { NucleobaseMock } from './NucleobaseMock';

import { DrawingMock } from './DrawingMock';

import { D } from './D';

import { Point, FinitePoint } from '@rnacanvas/points.oopified';

beforeAll(() => {
  if (!globalThis.SVGPathElement) {
    globalThis.SVGPathElement = SVGElement;
  }
});

describe('`class CurvedBond`', () => {
  test('`static between()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    base1.domNode.getBBox = () => ({ x: 0, y: 0, width: 5, height: 7.5 });
    base2.domNode.getBBox = () => ({ x: 0, y: 0, width: 2, height: 12.5 });

    var bond = CurvedBond.between(base1, base2);

    // passes nucleobase references correctly
    expect(bond.base1).toBe(base1);
    expect(bond.base2).toBe(base2);

    // assigns a universally unique ID that begins with a letter
    expect(bond.domNode.id.startsWith('id-')).toBeTruthy();
    expect(bond.domNode.id).toMatch(uuidRegex);

    // assigns some default values (exact values are hard-coded to match `static between()` method)
    expect(bond.domNode.getAttribute('stroke')).toBe('black');

    // adjust stroke width based on mean base height
    expect(Number.parseFloat(bond.domNode.getAttribute('stroke-width'))).toBeCloseTo(1.45);

    // explicitly assigns fill of "none"
    expect(bond.domNode.getAttribute('fill')).toBe('none');

    expect(bond.basePadding1.magnitude).toBeCloseTo(0.632 * 7.5);
    expect(bond.basePadding2.magnitude).toBeCloseTo(0.632 * 12.5);

    var d = D.matching(bond.domNode.getAttribute('d'));

    // gives curved bonds a single quad-to segment by default
    expect(d.trailingSegments.length).toBe(1);
    expect(d.trailingSegments[0].controlPoints.length).toBe(1);

    expect(() => FinitePoint.matching(d.startPoint)).not.toThrow();
    expect(() => FinitePoint.matching(d.endPoint)).not.toThrow();

    expect(() => FinitePoint.matching(d.trailingSegments[0].controlPoints[0])).not.toThrow();
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

  test('`binds()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var curvedBond = CurvedBond.between(base1, base2);

    expect(curvedBond.binds(base1)).toBe(true);
    expect(curvedBond.binds(base2)).toBe(true);

    var base3 = new NucleobaseMock();

    expect(curvedBond.binds(base3)).toBe(false);
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

  test('`get length()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var bond = CurvedBond.between(base1, base2);

    bond.domNode.getTotalLength = () => 18.2991;

    expect(bond.length).toBe(18.2991);
  });

  test('`atLength()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    base1.centerPoint = { x: 10, y: 80 };
    base2.centerPoint = { x: 50, y: 110 };

    var bond = CurvedBond.between(base1, base2);

    bond.domNode.getTotalLength = () => Point.matching(base1.centerPoint).distanceTo(base2.centerPoint);
    expect(bond.domNode.getTotalLength()).toBeCloseTo(50);

    bond.domNode.getPointAtLength = length => ({
      x: base1.centerPoint.x + (length * Math.cos(Point.matching(base1.centerPoint).directionTo(base2.centerPoint))),
      y: base1.centerPoint.y + (length * Math.sin(Point.matching(base1.centerPoint).directionTo(base2.centerPoint))),
    });

    // in the middle of the curved bond
    expect(bond.atLength(5).x).toBeCloseTo(10 + 4);
    expect(bond.atLength(5).y).toBeCloseTo(80 + 3);
    expect(bond.atLength(5).direction).toBeCloseTo(0.6435011087932844);

    // at the start point
    expect(bond.atLength(0).x).toBeCloseTo(10);
    expect(bond.atLength(0).y).toBeCloseTo(80);
    expect(bond.atLength(0).direction).toBeCloseTo(0.6435011087932844);

    // at the end point
    expect(bond.atLength(50).x).toBeCloseTo(50);
    expect(bond.atLength(50).y).toBeCloseTo(110);
    expect(bond.atLength(50).direction).toBeCloseTo(0.6435011087932844);

    // negative length
    expect(bond.atLength(-10).x).toBeCloseTo(10);
    expect(bond.atLength(-10).y).toBeCloseTo(80);
    expect(bond.atLength(-10).direction).toBeCloseTo(0.6435011087932844);

    // length greater than the length of the curved bond
    expect(bond.atLength(50 + 10).x).toBeCloseTo(50);
    expect(bond.atLength(50 + 10).y).toBeCloseTo(110);
    expect(bond.atLength(50 + 10).direction).toBeCloseTo(0.6435011087932844);

    // a curved bond with a length of zero
    base2.centerPoint = { ...base1.centerPoint };
    expect(bond.domNode.getTotalLength()).toBe(0);

    expect(bond.atLength(10).x).toBeCloseTo(10);
    expect(bond.atLength(10).y).toBeCloseTo(80);
    expect(bond.atLength(10).direction).toBeCloseTo(0);
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

  test('`remove()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    var curvedBond = CurvedBond.between(base1, base2);

    var drawing = new DrawingMock();

    drawing.domNode.append(curvedBond.domNode);

    expect(drawing.domNode.contains(curvedBond.domNode)).toBeTruthy();

    curvedBond.remove();

    expect(drawing.domNode.contains(curvedBond.domNode)).toBeFalsy();
  });

  test('`save()`', () => {
    var base1 = new NucleobaseMock();
    var base2 = new NucleobaseMock();

    base1.id = 'id-12345';
    base2.id = 'id-ABCDE';

    var bond = CurvedBond.between(base1, base2);

    bond.domNode.id = 'id-54321';

    var savedBond = bond.save();

    expect(savedBond).toStrictEqual({
      id: 'id-54321',

      baseID1: 'id-12345',
      baseID2: 'id-ABCDE',
    });

    // is JSON-stringifiable
    expect(() => JSON.stringify(savedBond)).not.toThrow();
  });

  test('`static recreate()`', () => {
    var parentDrawing = new DrawingMock();

    // add some extra SVG elements
    [...'123456789'].forEach(() => parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'path')));

    parentDrawing.domNode.childNodes.forEach(node => node.id = 'id-' + `${Math.random()}`.slice(2));

    expect((new Set([...parentDrawing.domNode.childNodes].map(node => node.id))).size).toBe(9);

    // add some bases
    [...'123456789'].forEach(() => parentDrawing.bases.push(new NucleobaseMock()));

    parentDrawing.bases.forEach(b => expect(b.id).toBeTruthy());

    var domNode = parentDrawing.domNode.childNodes[4];

    var base1 = parentDrawing.bases[7];
    var base2 = parentDrawing.bases[2];

    var bond1 = new CurvedBond(domNode, base1, base2);

    var savedBond = bond1.save();

    var bond2 = CurvedBond.recreate(savedBond, parentDrawing);

    expect(bond2.domNode).toBe(domNode);

    expect(bond2.base1).toBe(base1);
    expect(bond2.base2).toBe(base2);

    var legacyFormat = {
      pathId: domNode.id,

      baseId1: base1.id,
      baseId2: base2.id,
    };

    // check support for legacy formats
    var bond3 = CurvedBond.recreate(legacyFormat, parentDrawing);

    expect(bond3.domNode).toBe(domNode);

    expect(bond3.base1).toBe(base1);
    expect(bond3.base2).toBe(base2);
  });
});

const uuidRegex = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/;
