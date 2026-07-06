import type { Drawing } from './Drawing';

import type { Nucleobase } from './Nucleobase';

import { v4 as uuidv4 } from 'uuid';

import { D } from './D';

import { BasePadding } from './BasePadding';

import { Point, FinitePoint } from '@rnacanvas/points.oopified';

import { midpoint } from '@rnacanvas/points.oopified';

import { distance, direction } from '@rnacanvas/points';

import { isNonNullObject } from '@rnacanvas/value-check';

import { isString } from '@rnacanvas/value-check';

import { min, max } from '@rnacanvas/math';

import { mean } from '@rnacanvas/math';

export class CurvedBond<B extends Nucleobase> {
  /**
   * Creates and returns a new curved bond between the two bases.
   */
  static between<B extends Nucleobase>(base1: B, base2: B): CurvedBond<B> {
    let baseHeight1 = base1.domNode.getBBox().height;
    let baseHeight2 = base2.domNode.getBBox().height;

    let domNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // assign a universally unique ID that begins with a letter (SVG element IDs must begin with a letter)
    domNode.id = 'id-' + uuidv4();

    // assign some default values
    domNode.setAttribute('stroke', '#333');

    domNode.setAttribute('stroke-width', `${0.097 * mean([baseHeight1, baseHeight2])}`);
    domNode.setAttribute('stroke-opacity', '1');

    domNode.setAttribute('stroke-dasharray', '2 1.5');
    domNode.setAttribute('stroke-linecap', '');
    domNode.setAttribute('stroke-linejoin', '');

    // otherwise fill will be black by default in programs such as Adobe Illustrator
    domNode.setAttribute('fill', 'none');

    let mp = midpoint(base1.centerPoint, base2.centerPoint);

    // give curved bonds a single quad-to segment by default
    domNode.setAttribute('d', `M ${base1.centerPoint.x} ${base1.centerPoint.y} Q ${mp.x} ${mp.y} ${base2.centerPoint.x} ${base2.centerPoint.y}`);

    let bond = new CurvedBond(domNode, base1, base2);

    // give curved bonds some base paddings by default
    bond.basePadding1.magnitude = 0.632 * baseHeight1;
    bond.basePadding2.magnitude = 0.632 * baseHeight2;

    bond.basePadding1.direction = -Math.PI / 4;
    bond.basePadding2.direction = Math.PI / 4;

    let d = D.matching(bond.domNode.getAttribute('d'));

    mp = midpoint(d.startPoint, d.endPoint);

    // make slightly curved by default
    d.trailingSegments[0].controlPoints[0] = FinitePoint.matching(mp.displaced({
      magnitude: 0.25 * distance(d.startPoint, d.endPoint),
      direction: direction(d.startPoint, d.endPoint) - (Math.PI / 2),
    }));

    bond.domNode.setAttribute('d', d.toString());

    return bond;
  }

  constructor(readonly domNode: SVGPathElement, readonly base1: B, readonly base2: B) {
    // don't overwrite previously cached base paddings
    if (!domNode.dataset.basePadding1 && !domNode.dataset.basePadding2) {
      this.#cacheBasePaddings();
    }

    // reposition curved bonds when either base moves
    base1.addEventListener('change', () => this.#reposition());
    base2.addEventListener('change', () => this.#reposition());
  }

  get id(): string {
    return this.domNode.id;
  }

  /**
   * Returns `true` if the specified base is base 1 or 2 of the curved bond.
   *
   * Returns `false` otherwise.
   */
  binds(b: B): boolean {
    return b === this.base1 || b === this.base2;
  }

  /**
   * Note that the direction of base padding 1 is relative to the direction from base 1 to base 2.
   */
  get basePadding1() {
    let getBasePadding1 = () => BasePadding.from(this.domNode.dataset.basePadding1);

    let setBasePadding1 = (magnitude: number, direction: number) => {
      let basePadding1 = new BasePadding(magnitude, direction);

      this.domNode.dataset.basePadding1 = basePadding1.toJSON();

      this.#reposition();
    };

    let getMagnitude = () => getBasePadding1().magnitude;

    let getDirection = () => getBasePadding1().direction;

    let setMagnitude = (magnitude: number) => {
      setBasePadding1(magnitude, getDirection());
    };

    let setDirection = (direction: number) => {
      setBasePadding1(getMagnitude(), direction);
    };

    return {
      get magnitude() { return getMagnitude(); },
      set magnitude(magnitude) { setMagnitude(magnitude); },

      get direction() { return getDirection(); },
      set direction(direction) { setDirection(direction); },
    };
  }

  /**
   * Note that the direction of base padding 2 is relative to the direction from base 2 to base 1.
   */
  get basePadding2() {
    let getBasePadding2 = () => BasePadding.from(this.domNode.dataset.basePadding2);

    let setBasePadding2 = (magnitude: number, direction: number) => {
      let basePadding2 = new BasePadding(magnitude, direction);

      this.domNode.dataset.basePadding2 = basePadding2.toJSON();

      this.#reposition();
    };

    let getMagnitude = () => getBasePadding2().magnitude;

    let getDirection = () => getBasePadding2().direction;

    let setMagnitude = (magnitude: number) => {
      setBasePadding2(magnitude, getDirection());
    };

    let setDirection = (direction: number) => {
      setBasePadding2(getMagnitude(), direction);
    };

    return {
      get magnitude() { return getMagnitude(); },
      set magnitude(magnitude) { setMagnitude(magnitude); },

      get direction() { return getDirection(); },
      set direction(direction) { setDirection(direction); },
    };
  }

  get length(): number {
    return this.domNode.getTotalLength();
  }

  atLength(length: number) {
    length = length < 0 ? 0 : length;
    length = length > this.length ? this.length : length;

    let length1 = length - 0.005;
    let length2 = length + 0.005;

    // don't let lengths go out of bounds
    length1 = max([length1, 0]);
    length2 = min([length2, this.length]);

    let p1 = Point.matching(this.domNode.getPointAtLength(length1));
    let p2 = Point.matching(this.domNode.getPointAtLength(length2));

    let mp = midpoint(p1, p2);

    let direction = p1.directionTo(p2);

    // don't return a nonfinite number
    direction = Number.isFinite(direction) ? direction : 0;

    return {
      x: mp.x,
      y: mp.y,

      direction,
    };
  }

  drag(x: number, y: number, options?: { dragPoint?: PointLike, dragGroup?: Collection<SVGGraphicsElement> }): void {
    let dragGroup = options?.dragGroup;

    // let the curved bond be dragged with bases 1 or 2 (if bases 1 or 2 are already being dragged)
    if (dragGroup?.has(this.base1.domNode) || dragGroup?.has(this.base2.domNode)) {
      return;
    }

    let dragPoint = options?.dragPoint ?? this.domNode.getPointAtLength(this.domNode.getTotalLength() / 2);

    let d = D.matching(this.domNode.getAttribute('d'));

    d.drag(x, y, { dragPoint });

    // reposition the curved bond
    this.domNode.setAttribute('d', d.toString());

    this.#cacheBasePaddings();
  }

  remove(): void {
    this.domNode.remove();
  }

  /**
   * Returns the saved form of the curved bond.
   */
  save() {
    return {
      id: this.id,

      baseID1: this.base1.id,
      baseID2: this.base2.id,
    };
  }

  /**
   * Attempts to recreate a saved curved bond (given the parent drawing that its DOM node is in).
   *
   * Throws if unable to.
   */
  static recreate<B extends Nucleobase>(savedBond: unknown, parentDrawing: Drawing<B>): CurvedBond<B> | never {
    if (!isNonNullObject(savedBond)) {
      throw new Error(`Saved curved bond isn't an object: ${savedBond}.`);
    }

    // used to be saved under "pathId"
    let id = savedBond.id ?? savedBond.pathId;

    if (!isString(id)) {
      throw new Error(`Saved curved bond ID isn't a string: ${id}.`);
    }

    // used to be saved under "baseId1" and "baseId2"
    let baseID1 = savedBond.baseID1 ?? savedBond.baseId1;
    let baseID2 = savedBond.baseID2 ?? savedBond.baseId2;

    if (!isString(baseID1)) {
      throw new Error(`Saved curved bond base 1 ID isn't a string: ${baseID1}.`);
    } else if (!isString(baseID2)) {
      throw new Error(`Saved curved bond base 2 ID isn't a string: ${baseID2}.`);
    }

    let domNode = parentDrawing.domNode.querySelector('#' + id);

    if (!domNode) {
      throw new Error('Unable to find saved curved bond DOM node in parent drawing by ID.');
    } else if (!(domNode instanceof SVGPathElement)) {
      throw new Error(`Saved curved bond DOM node isn't an SVG path element: ${domNode}.`);
    }

    let bases = [...parentDrawing.bases];

    let base1 = bases.find(b => b.id === baseID1);
    let base2 = bases.find(b => b.id === baseID2);

    if (!base1) {
      throw new Error('Unable to find base 1 in parent drawing.');
    } else if (!base2) {
      throw new Error('Unable to find base 2 in parent drawing.');
    }

    return new CurvedBond(domNode, base1, base2);
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

    let displacements: [Point, Vector][] = d.interveningPoints.map(p => [p, mp.displacementTo(p)]);

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

type PointLike = {
  x: number;
  y: number;
};

interface Collection<T> {
  has(item: T): boolean;
};
