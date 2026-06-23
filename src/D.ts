import { SVGPathData } from 'svg-pathdata';

import { MoveToSegment } from './MoveToSegment';

import { TrailingSegment } from './TrailingSegment';

import type { FinitePoint } from '@rnacanvas/points.oopified';

import { Points } from './Points';

import { last } from '@rnacanvas/utilities';

import { isString } from '@rnacanvas/value-check';

/**
 * Represents an SVG path definition for a curved bond.
 */
export class D {
  static matching(d: string | undefined | unknown): D {
    let defaultD = DefaultD.create();

    if (!isString(d)) {
      return defaultD;
    }

    try {
      let data = new SVGPathData(d);

      // don't forget to convert to absolute
      data = data.toAbs();

      let moveToSegment = MoveToSegment.from(data.commands[0]);

      let trailingSegments: [TrailingSegment, ...TrailingSegment[]] = [
        TrailingSegment.from(data.commands[1]),
        ...data.commands.slice(2).map(command => TrailingSegment.from(command)),
      ];

      return new D(moveToSegment, trailingSegments);
    } catch {
      return defaultD;
    }
  }

  constructor(public moveToSegment: MoveToSegment, public trailingSegments: [TrailingSegment, ...TrailingSegment[]]) {}

  get segments(): [MoveToSegment, TrailingSegment, ...TrailingSegment[]] {
    return [
      this.moveToSegment,
      this.trailingSegments[0],
      ...this.trailingSegments.slice(1),
    ];
  }

  /**
   * All points defining the SVG path definition.
   */
  get definingPoints(): FinitePoint[] {
    return [
      this.startPoint,
      ...this.trailingSegments.flatMap(segment => [...segment.controlPoints, segment.endPoint]),
    ];
  }

  get startPoint(): FinitePoint {
    return this.moveToSegment.startPoint;
  }

  /**
   * All points defining the SVG path definition except for the start point and end point.
   */
  get interveningPoints(): FinitePoint[] {
    return [
      ...this.trailingSegments.slice(0, -1).flatMap(segment => [...segment.controlPoints, segment.endPoint]),
      ...last(this.trailingSegments).controlPoints,
    ];
  }

  /**
   * All control points in the SVG path definition.
   */
  get controlPoints(): FinitePoint[] {
    return this.trailingSegments.flatMap(segment => segment.controlPoints);
  }

  get endPoint(): FinitePoint {
    if (this.trailingSegments.length == 0) {
      throw new Error('This SVG path definition has no trailing segments.');
    }

    return last(this.trailingSegments).endPoint;
  }

  toString(): string {
    return this.segments.map(segment => segment.toString()).join(' ');
  }

  /**
   * The `dragPoint` is the point at which dragging was initiated from
   * (e.g., the point on the curve that was clicked on at the start of dragging).
   */
  drag(x: number, y: number, options: { dragPoint: { x: number, y: number } }): void {
    let definingPoints = new Points(this.definingPoints);

    // the point to drag
    let p = definingPoints.closest(options.dragPoint);

    // multiply by 2 for control points (since control points aren't directly on the curve)
    if (this.controlPoints.includes(p)) {
      x *= 2;
      y *= 2;
    }

    // modify the point in place
    p.displace({ x, y });
  }
}

/**
 * Represents the default SVG path definition for a curved bond.
 */
const DefaultD = {
  create: () => {
    // default to a path with a single quad-to command
    let data = new SVGPathData('M 0 0 Q 0 0 0 0');

    if (data.commands.length < 2) {
      throw new Error('Unable to create default SVG path definition.');
    }

    let moveToSegment = MoveToSegment.from(data.commands[0]);

    let trailingSegments: [TrailingSegment] = [
      TrailingSegment.from(data.commands[1]),
    ];

    return new D(moveToSegment, trailingSegments);
  },
}
