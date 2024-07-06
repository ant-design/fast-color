import { TinyColor } from '@ctrl/tinycolor';
import { rgba, toHex } from 'color2k';
import { bench } from 'vitest';
import { FastColor as FastColorES } from '../es';
import { FastColor } from '../src';

bench('@ctrl/tinycolor', () => {
  new TinyColor({ r: 11, g: 22, b: 33 }).toHexString();
});

bench('color2k', () => {
  toHex(rgba(11, 22, 33, 1));
});

bench('@ant-design/fast-color src', () => {
  new FastColor({ r: 11, g: 22, b: 33 }).toHexString();
});

bench('@ant-design/fast-color es', () => {
  new FastColorES({ r: 11, g: 22, b: 33 }).toHexString();
});
