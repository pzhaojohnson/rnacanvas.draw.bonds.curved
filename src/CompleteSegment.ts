import type { TrailingSegment } from './TrailingSegment';

import { AbstractPath } from '@rnacanvas/draw.svg';

export class CompleteSegment {
  readonly #trailingSegment;

  constructor(readonly startPoint: Point, trailingSegment: TrailingSegment) {
    this.#trailingSegment = trailingSegment;
  }

  get controlPoints() {
    return this.#trailingSegment.controlPoints;
  }

  get endPoint() {
    return this.#trailingSegment.endPoint;
  }

  /**
   * Returns the closest point within the segment to the specified point.
   *
   * The `precision` option roughly corresponds to the margin for error in the closest point calculation.
   *
   * Higher margin for error speeds up calculation.
   */
  closestPoint(p: Point, options?: { precision?: number }) {
    let precision = options?.precision ?? 5;

    let path = new AbstractPath(
      `M ${this.startPoint.x} ${this.startPoint.y} ${this.#trailingSegment.toString()}`
    );

    return path.closestPoint(p, { precision });
  }
}

type Point = {
  x: number;
  y: number;
};
