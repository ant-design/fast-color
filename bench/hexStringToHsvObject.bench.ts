import { TinyColor } from '@ctrl/tinycolor';
import { bench } from 'vitest';
import { FastColor as FastColorES } from '../es';
import { FastColor } from '../src';

bench('@ctrl/tinycolor', () => {
  new TinyColor('#66ccff').toHsv();
});

bench.skip('color2k', () => {
  // not supported
});

bench('@ant-design/fast-color src', () => {
  new FastColor('#66ccff').toHsv();
});

bench('@ant-design/fast-color es', () => {
  new FastColorES('#66ccff').toHsv();
});
