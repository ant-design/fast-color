import { rgbToHsv } from '@ctrl/tinycolor';
import type { HSV } from '../../src';
import { FastColor } from '../../src';

test('rgbToHsv alternative', () => {
  const r = 102,
    g = 204,
    b = 255;
  const hsv: HSV = rgbToHsv(r, g, b);
  hsv.h = Math.round(hsv.h * 360);
  hsv.a = 1;
  expect(new FastColor({ r, g, b }).toHsv()).toEqual(hsv);
});
