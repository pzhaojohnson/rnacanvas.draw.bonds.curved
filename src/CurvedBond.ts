import type { Nucleobase } from './Nucleobase';

import { v4 as uuidv4 } from 'uuid';

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

  constructor(readonly domNode: SVGPathElement, readonly base1: Nucleobase, readonly base2: Nucleobase) {}
}
