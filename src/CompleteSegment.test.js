/**
 * @jest-environment jsdom
 */

import { CompleteSegment } from './CompleteSegment';

import { TrailingSegment } from './TrailingSegment';

import { FinitePoint } from '@rnacanvas/points.oopified';

describe('`class CompleteSegment`', () => {
  test('`startPoint`', () => {
    var startPoint = { x: -11, y: 27 };

    var trailingSegment = new TrailingSegment([], new FinitePoint(0, 0));

    var completeSegment = new CompleteSegment(startPoint, trailingSegment);

    expect(completeSegment.startPoint.x).toBe(-11);
    expect(completeSegment.startPoint.y).toBe(27);
  });

  test('`controlPoints`', () => {
    var startPoint = { x: 0, y: 0 };

    var trailingSegment = new TrailingSegment(
      [
        new FinitePoint(80, 220),
        new FinitePoint(11, -12),
      ],
      new FinitePoint(0, 0),
    );

    var completeSegment = new CompleteSegment(startPoint, trailingSegment);

    expect(completeSegment.controlPoints.length).toBe(2);

    expect(completeSegment.controlPoints[0].x).toBe(80);
    expect(completeSegment.controlPoints[0].y).toBe(220);

    expect(completeSegment.controlPoints[1].x).toBe(11);
    expect(completeSegment.controlPoints[1].y).toBe(-12);
  });

  test('`endPoint`', () => {
    var startPoint = { x: 0, y: 0 };

    var trailingSegment = new TrailingSegment([], new FinitePoint(-12, -1000));

    var completeSegment = new CompleteSegment(startPoint, trailingSegment);

    expect(completeSegment.endPoint.x).toBe(-12);
    expect(completeSegment.endPoint.y).toBe(-1000);
  });

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
