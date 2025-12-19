import { FastColor } from '../src';

describe('hsl', () => {
	// Unified hex<->hsl fixtures
	const hexHslFixtures: { hex: string; hsl: { h: number; s: number; l: number } }[] = [
		// Boundaries
		{ hex: '#000000', hsl: { h: 0, s: 0, l: 0 } },
		{ hex: '#ffffff', hsl: { h: 0, s: 0, l: 1 } },

		// Primaries
		{ hex: '#ff0000', hsl: { h: 0, s: 1, l: 0.5 } },
		{ hex: '#00ff00', hsl: { h: 120, s: 1, l: 0.5 } },
		{ hex: '#0000ff', hsl: { h: 240, s: 1, l: 0.5 } },

		// Secondaries
		{ hex: '#ffff00', hsl: { h: 60, s: 1, l: 0.5 } },
		{ hex: '#00ffff', hsl: { h: 180, s: 1, l: 0.5 } },
		{ hex: '#ff00ff', hsl: { h: 300, s: 1, l: 0.5 } },

		// Specific samples
		{ hex: '#2400c2', hsl: { h: 251, s: 1, l: 0.3804 } },
		{ hex: '#3d5dff', hsl: { h: 230, s: 1, l: 0.6196 } },
	];

	// hex -> hsl object values and roundtrip
	hexHslFixtures.forEach(({ hex, hsl: expected }) => {
		it(`hex to hsl object values: ${hex}`, () => {
			const hsl = new FastColor(hex).toHsl();
			expect(hsl.h).toBe(expected.h);
			expect(hsl.s).toBe(expected.s);
			expect(hsl.l).toBeCloseTo(expected.l, 4);
			expect(hsl.a).toBe(1);

			const back = new FastColor(hsl).toHexString();
			expect(back).toBe(hex);
		});
	});

	it('setHue should not change lightness', () => {
		const base = new FastColor('#1677ff');
		expect(base.getLightness()).toBeCloseTo(new FastColor('#1677ff').getLightness(), 4);

		const turn = base.setHue(233);
		expect(turn.getLightness()).toBeCloseTo(base.getLightness(), 4);
	});

	const hslaAlphaCases: [string, string, number][] = [
		['hsla(251, 100%, 38%, 0.5)', 'hsla(251,100%,38%,0.5)', 0.5],
		['hsla(120, 25%, 33%, 0.7)', 'hsla(120,25%,33%,0.7)', 0.7],
	];

	hslaAlphaCases.forEach(([str, normalized, alpha]) => {
		it(`supports hsla alpha: ${str}`, () => {
			expect(new FastColor(str).toHslString()).toBe(normalized);
			expect(new FastColor(str).toRgb().a).toBe(alpha);
		});
	});

	it('hue 0 and 360 are equivalent', () => {
		const c0 = new FastColor('hsl(0, 100%, 50%)');
		const c360 = new FastColor('hsl(360, 100%, 50%)');
		expect(c0.toHexString()).toBe(c360.toHexString());
	});

	it('s=0 yields grayscale regardless of hue', () => {
		const a = new FastColor('hsl(0, 0%, 40%)');
		const b = new FastColor('hsl(200, 0%, 40%)');
		expect(a.toHexString()).toBe(b.toHexString());
	});

	it('roundtrip toHslString keeps values', () => {
		const c = new FastColor('hsla(120, 25%, 33%, 0.7)');
		expect(c.toHslString()).toBe('hsla(120,25%,33%,0.7)');
		const parsed = new FastColor(c.toHslString());
		expect(parsed.toHslString()).toBe('hsla(120,25%,33%,0.7)');
	});

	it('darken and lighten adjust lightness bounds', () => {
		const c = new FastColor('hsl(200, 50%, 50%)');
		const darker = c.darken(20);
		const lighter = c.lighten(20);
		expect(darker.getLightness()).toBeCloseTo(c.getLightness() - 0.2, 4);
		expect(lighter.getLightness()).toBeCloseTo(c.getLightness() + 0.2, 4);

		const minCap = c.darken(100);
		const maxCap = c.lighten(100);
		expect(minCap.getLightness()).toBe(0);
		expect(maxCap.getLightness()).toBe(1);
	});

	it('normalizes H outside range for HSL (object input)', () => {
		// -60 -> 300 (magenta)
		expect(new FastColor({ h: -60, s: 1, l: 0.5 }).toHexString()).toBe('#ff00ff');
		// 420 -> 60 (yellow)
		expect(new FastColor({ h: 420, s: 1, l: 0.5 }).toHexString()).toBe('#ffff00');
	});
});

