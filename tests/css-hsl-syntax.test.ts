import { FastColor } from '../src';

// Support CSS hsl() and rgba() syntax with absolute values
// https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl
describe('css rgb() syntax', () => {
  describe('new space-separated syntax', () => {
    it('parse number (0-255)', () => {
      expect(new FastColor('rgb(255 255 255)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });

    it('parse number alpha (0-1)', () => {
      expect(new FastColor('rgb(255 255 255 / 0.2)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.2,
      });

      expect(new FastColor('rgb(255 255 255 / .2)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.2,
      });

      expect(new FastColor('rgb(255 255 255 / 0.233)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.233,
      });

      expect(new FastColor('rgb(255 255 255 / .233)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.233,
      });
    });

    it('parse percentage (0-100%)', () => {
      expect(new FastColor('rgb(100% 100% 100%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });

      expect(new FastColor('rgb(100% 100% 100%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });

    it('parse percentage alpha (0-1)', () => {
      expect(new FastColor('rgb(100% 100% 100% / 20%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.2,
      });

      expect(new FastColor('rgb(100% 100% 100% / 23.3%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.233,
      });
    });
  });

  describe('old comma-separated syntax', () => {
    it('parse number (0-255)', () => {
      expect(new FastColor('rgb(255, 255, 255)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });

    it('parse number alpha (0-1)', () => {
      expect(new FastColor('rgba(255, 255, 255, 0.2)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.2,
      });

      expect(new FastColor('rgba(255, 255, 255, .2)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.2,
      });

      expect(new FastColor('rgba(255, 255, 255, 0.233)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.233,
      });

      expect(new FastColor('rgba(255, 255, 255, .233)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.233,
      });
    });

    it('parse percentage (0-100%)', () => {
      expect(new FastColor('rgb(100%, 100%, 100%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });

    it('parse percentage alpha (0-1)', () => {
      expect(new FastColor('rgba(100%, 100%, 100%, 20%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.2,
      });

      expect(new FastColor('rgba(100%, 100%, 100%, 23.3%)').toRgb()).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.233,
      });
    });
  });
});
