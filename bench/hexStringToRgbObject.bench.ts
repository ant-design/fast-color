import { TinyColor } from '@ctrl/tinycolor';
import { parseToRgba } from 'color2k';
import { bench } from 'vitest';
import { FastColor as FastColorES } from '../es';
import { FastColor } from '../src';

bench('@ctrl/tinycolor', () => {
  new TinyColor('#66ccff').toRgb();
});

bench('color2k', () => {
  parseToRgba('#66ccff');
});

bench('@ant-design/fast-color src', () => {
  new FastColor('#66ccff').toRgb();
});

bench('@ant-design/fast-color es', () => {
  new FastColorES('#66ccff').toRgb();
});
