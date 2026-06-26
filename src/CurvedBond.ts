import type { Nucleobase } from './Nucleobase';

import { v4 as uuidv4 } from 'uuid';

import { D } from './D';

import { midpoint } from '@rnacanvas/points.oopified';

import { BasePadding } from './BasePadding';

import { direction } from '@rnacanvas/points';

import { Point } from '@rnacanvas/points.oopified';

export class CurvedBond {
  /**
   * Creates and returns a new curved bond between the two bases.
   */
  static between(base1: Nucleobase, base2: Nucleobase): CurvedBond {
    let domNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // assign a universally unique ID that begins with a letter (SVG element IDs must begin with a letter)
    domNode.id = 'id-' + uuidv4();

    // assign some default values
    domNode.setAttribute('stroke', 'black');

    domNode.setAttribute('stroke-width', '1.5');
    domNode.setAttribute('stroke-opacity', '1');

    domNode.setAttribute('stroke-dasharray', '');
    domNode.setAttribute('stroke-linecap', '');
    domNode.setAttribute('stroke-linejoin', '');

    // otherwise fill will be black by default in programs such as Adobe Illustrator
    domNode.setAttribute('fill', 'none');

    let bond = new CurvedBond(domNode, base1, base2);

    return bond;
  }

  constructor(readonly domNode: SVGPathElement, readonly base1: Nucleobase, readonly base2: Nucleobase) {
    // reposition curved bonds when either base moves
    base1.addEventListener('change', () => this.#reposition());
    base2.addEventListener('change', () => this.#reposition());
  }

  get id(): string {
    return this.domNode.id;
  }

  /**
   * Repositions the curved bond based on the current positions of bases 1 and 2
   * and the cached base paddings.
   */
  #reposition(): void {
    let basePadding1 = BasePadding.from(this.domNode.dataset.basePadding1);
    let basePadding2 = BasePadding.from(this.domNode.dataset.basePadding2);

    // absolutize
    basePadding1 = this.#absolutized1(basePadding1);
    basePadding2 = this.#absolutized2(basePadding2);

    let d = D.matching(this.domNode.getAttribute('d'));

    let mp = midpoint(d.startPoint, d.endPoint);

    let displacements: [Point, Vector][] = d.interveningPoints.map(p => [Point.matching(p), mp.displacementTo(p)]);

    // relativize displacements
    displacements.forEach(([_, v]) => v.direction -= direction(d.startPoint, d.endPoint));

    // reposition start and end points
    d.startPoint.set(Point.matching(this.base1.centerPoint).displaced(basePadding1));
    d.endPoint.set(Point.matching(this.base2.centerPoint).displaced(basePadding2));

    // recalculate midpoint
    mp = midpoint(d.startPoint, d.endPoint);

    // absolutize displacements
    displacements.forEach(([_, v]) => v.direction += direction(d.startPoint, d.endPoint));

    // reposition intervening points
    displacements.forEach(([p, v]) => p.set(mp.displaced(v)));

    this.domNode.setAttribute('d', d.toString());
  }

  #cacheBasePaddings(): void {
    let d = D.matching(this.domNode.getAttribute('d'));

    let basePadding1 = BasePadding.matching(Point.matching(this.base1.centerPoint).displacementTo(d.startPoint));
    let basePadding2 = BasePadding.matching(Point.matching(this.base2.centerPoint).displacementTo(d.endPoint));

    // relativize
    basePadding1 = this.#relativized1(basePadding1);
    basePadding2 = this.#relativized2(basePadding2);

    // cache
    this.domNode.dataset.basePadding1 = basePadding1.toJSON();
    this.domNode.dataset.basePadding2 = basePadding2.toJSON();
  }

  /**
   * Returns a new base padding object with its direction absolutized to the direction from base 1 to base 2.
   *
   * Doesn't modify the input base padding object.
   */
  #absolutized1(basePadding: BasePadding): BasePadding {
    let absolutized = BasePadding.matching(basePadding);

    absolutized.direction += direction(this.base1.centerPoint, this.base2.centerPoint);

    return absolutized;
  }

  /**
   * Returns a new base padding object with its direction absolutized to the direction from base 2 to base 1.
   *
   * Doesn't modify the input base padding object.
   */
  #absolutized2(basePadding: BasePadding): BasePadding {
    let absolutized = BasePadding.matching(basePadding);

    absolutized.direction += direction(this.base2.centerPoint, this.base1.centerPoint);

    return absolutized;
  }

  /**
   * Returns a new base padding object with its direction relativized to the direction from base 1 to base 2.
   *
   * Doesn't modify the input base padding object.
   */
  #relativized1(basePadding: BasePadding): BasePadding {
    let relativized = BasePadding.matching(basePadding);

    relativized.direction -= direction(this.base1.centerPoint, this.base2.centerPoint);

    return relativized;
  }

  /**
   * Returns a new base padding object with its direction relativized to the direction from base 2 to base 1.
   *
   * Doesn't modify the input base padding object.
   */
  #relativized2(basePadding: BasePadding): BasePadding {
    let relativized = BasePadding.matching(basePadding);

    relativized.direction -= direction(this.base2.centerPoint, this.base1.centerPoint);

    return relativized;
  }
}

type Vector = ReturnType<Point['displacementTo']>;
