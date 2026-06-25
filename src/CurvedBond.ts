import type { Nucleobase } from './Nucleobase';

export class CurvedBond {
  constructor(readonly domNode: SVGPathElement, readonly base1: Nucleobase, readonly base2: Nucleobase) {}
}
