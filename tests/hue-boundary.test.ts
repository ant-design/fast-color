import { FastColor } from '../src';

/**
 * Regression coverage for https://github.com/ant-design/ant-design/issues/58039
 *
 * `getHue()` formerly returned 360 for colors whose computed hue rounds up to
 * the boundary (e.g. #DB393A — math yields ~359.63, round → 360). Hue is
 * defined on [0, 360), and downstream `fromHsv()` uses `Math.floor(h / 60)`
 * as a switch index — h=360 lands in the default branch (case 5, magenta
 * sector), so a near-red gets painted as purple.
 *
 * The fix in `getHue()` applies `% 360` so 360 normalises to 0 (red).
 */
describe('hue boundary normalisation (#58039)', () => {
  it('#DB393A — the original repro — reports red hue, not magenta', () => {
    const color = new FastColor('#DB393A');
    const hue = color.getHue();
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360); // critical: never == 360
    // Real hue is just under 360°, which after `% 360` normalises to 0.
    expect(hue).toBe(0);
  });

  it('hue stays in [0, 360) for a sweep of near-red colors', () => {
    // Colors crafted to land in the (g < b, r === max) branch where the
    // round-up to 360 can happen. Each should report hue in [0, 360).
    const samples = ['#DB393A', '#FF0001', '#FE0001', '#C82122', '#A52A2B'];
    for (const hex of samples) {
      const h = new FastColor(hex).getHue();
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });

  it('toHsv on #DB393A reports h=0 (red sector), not magenta', () => {
    const hsv = new FastColor('#DB393A').toHsv();
    expect(hsv.h).toBe(0);
  });

  it('round-tripping #DB393A through HSV preserves the red character', () => {
    const original = new FastColor('#DB393A');
    const roundTrip = new FastColor(original.toHsv());
    // The R channel should remain dominant — i.e. r is still the largest
    // component, so the round-trip didn't drift into the magenta sector
    // (where b would suddenly jump from ~58 to ~219).
    expect(roundTrip.r).toBeGreaterThan(roundTrip.b);
    expect(roundTrip.r).toBeGreaterThan(roundTrip.g);
  });

  it('previously-correct hues are unaffected', () => {
    // Spot-check a handful of hues that were never near the 360 boundary.
    expect(new FastColor('#ff0000').getHue()).toBe(0);
    expect(new FastColor('#00ff00').getHue()).toBe(120);
    expect(new FastColor('#0000ff').getHue()).toBe(240);
    expect(new FastColor('#ffff00').getHue()).toBe(60);
    expect(new FastColor('#ff00ff').getHue()).toBe(300);
  });
});
