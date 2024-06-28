import { rgbToHsv } from '@ctrl/tinycolor';
import { FastColor } from '../../src';

test('rgbToHsv alternative', () => {
  expect(rgbToHsv(11, 22, 33)).toEqual({
    h: 0.5833333333333334,
    s: 0.6666666666666667,
    v: 0.12941176470588237,
  });

  expect(new FastColor({ r: 11, g: 22, b: 33 }).toHsv()).toEqual({
    h: 360 * 0.5833333333333334,
    s: 0.6666666666666666,
    v: 0.12941176470588237,
    a: 1,
  });

  expect(new FastColor('#66ccff').toHsv()).toBe('');
});
