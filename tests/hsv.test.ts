import { FastColor } from '../src';

describe('hsv', () => {
  it('hsv object to hex', () => {
    expect(new FastColor({ h: 270, s: 0.6, v: 0.4 }).toHexString()).toBe(
      '#472966',
    );
  });
});
