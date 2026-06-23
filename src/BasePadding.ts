import { isString } from '@rnacanvas/value-check';

import { Vector } from '@rnacanvas/vectors.oopified';

import type { VectorLike } from '@rnacanvas/vectors.oopified';

import { isVectorLike } from '@rnacanvas/vectors.oopified';

/**
 * A base padding vector.
 *
 * Note that the direction of a base padding vector is relative to its parent bond.
 */
export class BasePadding {
  /**
   * Creates and returns a new base padding vector based on a given value
   * (e.g., JSON of a pre-existing base padding vector).
   *
   * Values of undefined (or otherwise unrecognized values)
   * result in a base padding vector with magnitude and direction of zero being returned.
   *
   * This method doesn't throw.
   */
  static from(value: string | undefined | unknown): BasePadding {
    // create a new zero base padding vector each time
    let zeroBasePadding = new BasePadding(0, 0);

    if (!isString(value)) {
      return zeroBasePadding;
    }

    let vector: unknown;

    try {
      vector = JSON.parse(value);
    } catch {
      return zeroBasePadding;
    }

    if (!isVectorLike(vector)) {
      return zeroBasePadding;
    }

    let v = Vector.matching(vector);

    return new BasePadding(v.magnitude, v.direction);
  }

  constructor(public magnitude: number, public direction: number) {}

  toJSON(): string {
    return JSON.stringify({
      magnitude: this.magnitude,
      direction: this.direction,
    });
  }
}
