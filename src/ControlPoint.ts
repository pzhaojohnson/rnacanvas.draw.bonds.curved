import { FinitePoint } from '@rnacanvas/points.oopified';

export class ControlPoint extends FinitePoint {
  drag(x: number, y: number): void {
    x *= 2;
    y *= 2;

    super.drag(x, y);
  }
}
