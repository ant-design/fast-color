import { FastColor } from '../src';

// Support CSS rgb() and rgba() syntax with absolute values
// https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb
describe('css rgb() syntax', () => {
  describe('new space-separated syntax', () => {
    it('parse integer (0-255)', () => {
      expect(new FastColor('rgb(255 255 255)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });

    it('parse percent (0-100%)', () => {
      expect(new FastColor('rgb(100% 100% 100%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });
  });

  describe('old comma-separated syntax', () => {
    it('parse integer (0-255)', () => {
      expect(new FastColor('rgb(255, 255, 255)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });

    it('parse percent (0-100%)', () => {
      expect(new FastColor('rgb(100%, 100%, 100%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });
  });
});
