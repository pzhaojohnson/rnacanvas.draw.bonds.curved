import type { Nucleobase } from './Nucleobase';

export interface Drawing<B extends Nucleobase> {
  readonly domNode: SVGSVGElement;

  /**
   * All bases in the drawing.
   */
  readonly bases: Iterable<B>;
}
