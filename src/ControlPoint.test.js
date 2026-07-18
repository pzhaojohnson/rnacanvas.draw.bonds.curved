import { ControlPoint } from './ControlPoint';

describe('`class ControlPoint`', () => {
  test('`drag()`', () => {
    var p = new ControlPoint(2, 20);

    p.drag(-5, 59);

    // multiplies X and Y components by 2 (for control points)
    expect(p.x).toBeCloseTo(-8);
    expect(p.y).toBeCloseTo(138);
  });
});
