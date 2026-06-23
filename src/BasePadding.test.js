import { BasePadding } from './BasePadding';

describe('`class BasePadding`', () => {
  test('`static from()`', () => {
    var bp = new BasePadding(23, Math.PI / 9);

    // from base padding JSON
    expect(BasePadding.from(bp.toJSON())).toStrictEqual(bp);

    // from null
    expect(BasePadding.from(null)).toStrictEqual(new BasePadding(0, 0));

    // from undefined
    expect(BasePadding.from(undefined)).toStrictEqual(new BasePadding(0, 0));

    // from some random values
    expect(BasePadding.from('asdf')).toStrictEqual(new BasePadding(0, 0));
    expect(BasePadding.from(2)).toStrictEqual(new BasePadding(0, 0));
    expect(BasePadding.from(false)).toStrictEqual(new BasePadding(0, 0));
    expect(BasePadding.from({})).toStrictEqual(new BasePadding(0, 0));

    // returns a new zero base padding vector each time
    expect(BasePadding.from(undefined)).not.toBe(BasePadding.from(undefined));
    expect(BasePadding.from(undefined)).toStrictEqual(BasePadding.from(undefined));
  });

  test('`constructor()`', () => {
    var bp = new BasePadding(-57, Math.PI / 10);

    // stores magnitude and direction
    expect(bp.magnitude).toBe(-57);
    expect(bp.direction).toBe(Math.PI / 10);
  });

  test('`toJSON()`', () => {
    var bp = new BasePadding(180.1, -Math.PI / 5);

    expect(bp.toJSON()).toBe(JSON.stringify({ magnitude: 180.1, direction: -Math.PI / 5 }));
  });
});
