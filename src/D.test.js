import { D } from './D';

import { MoveToSegment } from './MoveToSegment';

import { TrailingSegment } from './TrailingSegment';

import { FinitePoint } from '@rnacanvas/points.oopified';

import { SVGPathData } from 'svg-pathdata';

describe('`class D`', () => {
  test('`static matching()`', () => {
    // just one trailing segment
    var d = D.matching('M -10 2 Q 50 100 -2.5 -8');

    [[-10, 2], [50, 100], [-2.5, -8]].forEach((coordinates, i) => {
      expect(d.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });

    // multiple trailing segments of different types
    var d = D.matching('M 0 3 L 50 -100 Q 50 80 -2.9 -12 C 50 200 1 2 -12 15');

    [[0, 3], [50, -100], [50, 80], [-2.9, -12], [50, 200], [1, 2], [-12, 15]].forEach((coordinates, i) => {
      expect(d.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });

    // converts relative paths to absolute paths
    var d = D.matching('M 100 10 q 50 -2 -50 25 q 80 20 1 5');

    [[100, 10], [150, 8], [50, 35], [130, 55], [51, 40]].forEach((coordinates, i) => {
      expect(d.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });

    // undefined
    expect(D.matching(undefined)).toStrictEqual(D.matching('M 0 0 Q 0 0 0 0'));

    // null
    expect(D.matching(null)).toStrictEqual(D.matching('M 0 0 Q 0 0 0 0'));

    // an empty path definition string
    expect(D.matching('')).toStrictEqual(D.matching('M 0 0 Q 0 0 0 0'));

    // a random path definition string
    expect(D.matching('asdf')).toStrictEqual(D.matching('M 0 0 Q 0 0 0 0'));

    // doesn't start with an "M" command
    expect(D.matching('L 10 20')).toStrictEqual(D.matching('M 0 0 Q 0 0 0 0'));

    // just an "M" command
    expect(D.matching('M 1 2')).toStrictEqual(D.matching('M 0 0 Q 0 0 0 0'));

    // not all trailing commands are "L", "Q" or "C" commands
    expect(D.matching('M 0 0 Q 1 2 3 4 Q 5 6 7 8 H 9 Q 11 12 13 14')).toStrictEqual(D.matching('M 0 0 Q 0 0 0 0'));

    // there's a nonfinite number in the path definition
    expect(D.matching('M 0 0 Q 1 Infinity -1 -2')).toStrictEqual(D.matching('M 0 0 Q 0 0 0 0'));
  });

  test('`constructor()`', () => {
    var data = new SVGPathData('M 1 5 Q 0 10 20 100 L 80 40');

    var moveToSegment = MoveToSegment.matching(data.commands[0]);

    var trailingSegments = data.commands.slice(1).map(command => TrailingSegment.matching(command));

    var d = new D(moveToSegment, trailingSegments);

    // stores move-to segment
    expect(d.moveToSegment).toBe(moveToSegment);

    // stores trailing segments
    expect(d.trailingSegments).toBe(trailingSegments);
  });

  test('`get segments()`', () => {
    // just one trailing command
    var d = D.matching('M -25.6 88 Q 100 -200 -3.4 6');

    expect(d.segments.map(segment => segment.toString())).toStrictEqual([
      'M -25.6 88',
      'Q 100 -200 -3.4 6',
    ]);

    // multiple trailing commands
    var d = D.matching('M 50 60 Q -10 20 30 0 Q 6 20 50 100 C 80 20 -1 -2 3 8 L -10 -12');

    expect(d.segments.map(segment => segment.toString())).toStrictEqual([
      'M 50 60',
      'Q -10 20 30 0',
      'Q 6 20 50 100',
      'C 80 20 -1 -2 3 8',
      'L  -10 -12',
    ]);
  });

  test('`get definingPoints()`', () => {
    // just one trailing segment
    var d = D.matching('M -10 2 Q 50 100 -2.5 -8');

    [[-10, 2], [50, 100], [-2.5, -8]].forEach((coordinates, i) => {
      expect(d.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });

    // multiple trailing segments of different types
    var d = D.matching('M 0 3 L 50 -100 Q 50 80 -2.9 -12 C 50 200 1 2 -12 15');

    [[0, 3], [50, -100], [50, 80], [-2.9, -12], [50, 200], [1, 2], [-12, 15]].forEach((coordinates, i) => {
      expect(d.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });
  });

  test('`get startPoint()`', () => {
    // just one trailing command
    var d = D.matching('M -25.6 88 Q 100 -200 -3.4 6');

    expect(d.startPoint).toStrictEqual(new FinitePoint(-25.6, 88));

    // multiple trailing commands
    var d = D.matching('M -50 10 Q 0 0 30 40 Q 12 15 -2 -5 L 10 100');

    expect(d.startPoint).toStrictEqual(new FinitePoint(-50, 10));
  });

  test('`get interveningPoints()`', () => {
    // zero intervening points
    var d = D.matching('M -10 2 L -2.5 -8');

    expect(d.interveningPoints).toStrictEqual([]);

    // multiple intervening points
    var d = D.matching('M 0 3 L 50 -100 Q 50 80 -2.9 -12 C 50 200 1 2 -12 15');

    expect(d.interveningPoints.length).toBe(5);

    [[50, -100], [50, 80], [-2.9, -12], [50, 200], [1, 2]].forEach((coordinates, i) => {
      expect(d.interveningPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });
  });

  test('`get controlPoints()`', () => {
    // zero control points
    var d = D.matching('M -10 2 L -2.5 -8');

    expect(d.controlPoints).toStrictEqual([]);

    // multiple control points
    var d = D.matching('M 0 3 L 50 -100 Q 50 80 -2.9 -12 C 50 200 1 2 -12 15');

    expect(d.controlPoints.length).toBe(3);

    [[50, 80], [50, 200], [1, 2]].forEach((coordinates, i) => {
      expect(d.controlPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });
  });

  test('`get endPoint()`', () => {
    // just one trailing segment
    var d = D.matching('M 10 20 Q 50 100 2 -24');

    expect(d.endPoint).toStrictEqual(new FinitePoint(2, -24));

    // multiple trailing segments
    var d = D.matching('M 1 2 Q 30 20 1 5 L -10 -20 C 1 2 50 97 -15.2 18');

    expect(d.endPoint).toStrictEqual(new FinitePoint(-15.2, 18));

    // should return the same point object (to facilitate direct modification)
    expect(d.endPoint).toBe(d.segments[3].endPoint);
  });

  test('`toString()`', () => {
    // just one trailing command
    var d = D.matching('M -25.6 88 Q 100 -200 -3.4 6');

    // modify the path definition some
    d.startPoint.x  = 57;
    d.segments[1].controlPoints[0].y = 208;
    d.segments[1].endPoint.y = -0.84;

    expect(d.toString()).toStrictEqual('M 57 88 Q 100 208 -3.4 -0.84');

    // multiple trailing commands
    var d = D.matching('M 50 60 Q -10 20 30 0 C -10 -20 6 20 50 100 Q -1 -2 3 8 L 200 300');

    // modify the path definition some
    d.startPoint.x = -2;
    d.segments[1].controlPoints[0].x = -2000;
    d.segments[2].endPoint.y = 500;
    d.endPoint.x += 5;

    expect(d.toString()).toBe('M -2 60 Q -2000 20 30 0 C -10 -20 6 20 50 500 Q -1 -2 3 8 L  205 300');
  });

  test('`drag()`', () => {
    var d = D.matching('M 10 20 Q 125 250 50 100');

    // dragging the start point
    d.drag(-4, 56, { dragPoint: { x: 8, y: 9 } });

    expect(d.startPoint).toStrictEqual(new FinitePoint(6, 76));

    // dragging the final end point
    d.drag(-19, -100, { dragPoint: { x: 48, y: 101 } });

    // end point not moved
    expect(d.endPoint).toStrictEqual(new FinitePoint(31, 0));

    // multiple intervening points
    var d = D.matching('M -55 100 L 20 30 Q 80 100 201 5 C 30 20 1 2 -8 -10');

    // dragging a control point
    d.drag(8, 27, { dragPoint: { x: 29.5, y: 19 } });

    // must multiply X and Y drag components by 2 (for control points)
    expect(d.segments[3].controlPoints[0]).toStrictEqual(new FinitePoint(46, 74));

    // the point to be dragged
    var p = d.segments[2].endPoint;

    // dragging an intervening end point
    d.drag(-12, 25, { dragPoint: { x: 199, y: 3 } });

    expect(d.segments[2].endPoint).toStrictEqual(new FinitePoint(189, 30));

    // modifies the point in place (i.e., doesn't create a new "dragged" point)
    expect(d.segments[2].endPoint).toBe(p);
  });
});
