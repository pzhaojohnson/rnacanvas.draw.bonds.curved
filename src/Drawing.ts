import type { Nucleobase } from './Nucleobase';

export interface Drawing {
  readonly domNode: SVGSVGElement;

  /**
   * All bases in the drawing.
   */
  readonly bases: Iterable<Nucleobase>;
}
