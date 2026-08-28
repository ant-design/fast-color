import { FastColor } from '../src';

/**
 * Regression coverage for https://github.com/ant-design/ant-design/issues/58039
 *
 * `getHue()` previously returned 360 for colors whose computed hue rounds up
 * to the upper boundary — e.g. `#DB393A` yields ~359.63, `round → 360`. Hue
 * is defined on the half-open range [0, 360). This class's own `fromHsv()`
 * normalises its `h` input, so an internal HSV round-trip within this class
 * masks the bug. Downstream consumers (Ant Design's ColorPicker feeds the
 * value directly to canvas hue-slider math) do not normalise and paint red
 * as magenta at the boundary — see @afc163's confirmation on the issue.
 *
 * The fix in `getHue()` applies `% 360` so 360 collapses back to 0 (red).
 * These tests pin the boundary directly on the `getHue()` / `toHsv()`
 * surface: each assertion fails against the pre-fix source and passes
 * against the current source, so a regression back to the boundary-360
 * behaviour would fail loudly here.
 */
describe('hue boundary normalisation (#58039)', () => {
  it('#DB393A — the original repro — reports h=0, not 360', () => {
    const color = new FastColor('#DB393A');
    const hue = color.getHue();
    expect(hue).toBeGreaterThanOrEqual(0);
    // Critical: hue is defined on [0, 360). A returned 360 is the bug and
    // is what downstream consumers of `getHue()` mis-render as magenta.
    expect(hue).toBeLessThan(360);
    // Real hue is ~359.63, and after `% 360` it normalises to 0.
    expect(hue).toBe(0);
  });

  it('hue stays in [0, 360) for a sweep of near-red colors', () => {
    // Colors crafted to land in the (r === max, g < b) branch of `getHue()`
    // where the round-up to 360 can occur. Each must report a hue in the
    // documented half-open range.
    const samples = ['#DB393A', '#FF0001', '#FE0001', '#C82122', '#A52A2B'];
    for (const hex of samples) {
      const h = new FastColor(hex).getHue();
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });

  it('toHsv on #DB393A reports h=0 on the getter surface', () => {
    // The `toHsv()` surface must expose the same normalised value, since
    // downstream consumers reading `toHsv().h` (rather than round-tripping
    // through `fromHsv`) also depend on the [0, 360) invariant.
    const hsv = new FastColor('#DB393A').toHsv();
    expect(hsv.h).toBe(0);
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
