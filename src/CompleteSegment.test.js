/**
 * @jest-environment jsdom
 */

import { CompleteSegment } from './CompleteSegment';

import { TrailingSegment } from './TrailingSegment';

import { FinitePoint } from '@rnacanvas/points.oopified';

describe('`class CompleteSegment`', () => {
  test('`closestPoint()`', () => {
    var startPoint = { x: 25, y: -20 };

    var controlPoints = [
      new FinitePoint(100, -20),
    ];

    var endPoint = new FinitePoint(150, -20);

    var trailingSegment = new TrailingSegment(controlPoints, endPoint)

    // a horizontal line
    var completeSegment = new CompleteSegment(startPoint, trailingSegment);

    SVGElement.prototype.getPointAtLength = length => ({
      x: 25 + length,
      y: -20,
    });

    SVGElement.prototype.getTotalLength = () => 125;

    // without specifying precision
    var p = completeSegment.closestPoint({ x: 131, y: 10 });

    // assuming a default precision of 5
    expect(p.x).toBeCloseTo(130);
    expect(p.y).toBeCloseTo(-20);

    // specifying precision
    var p = completeSegment.closestPoint({ x: 131, y: 10 }, { precision: 20 });

    expect(p.x).toBeCloseTo(125);
    expect(p.y).toBeCloseTo(-20);
  });
});
