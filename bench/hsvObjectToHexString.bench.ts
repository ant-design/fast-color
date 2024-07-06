import { TinyColor } from '@ctrl/tinycolor';
import { bench } from 'vitest';
import { FastColor as FastColorES } from '../es';
import { FastColor } from '../src';

bench('@ctrl/tinycolor', () => {
  new TinyColor({ h: 270, s: 0.6, v: 0.5 }).toHexString();
});

bench.skip('color2k', () => {
  // not supported
});

bench('@ant-design/fast-color src', () => {
  new FastColor({ h: 270, s: 0.6, v: 0.5 }).toHexString();
});

bench('@ant-design/fast-color es', () => {
  new FastColorES({ h: 270, s: 0.6, v: 0.5 }).toHexString();
});
