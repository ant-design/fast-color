import { TinyColor } from '@ctrl/tinycolor';
import { parseToHsla } from 'color2k';
import { bench } from 'vitest';
import { FastColor as FastColorES } from '../es';
import { FastColor } from '../src';

bench('@ctrl/tinycolor', () => {
  new TinyColor('#66ccff').toHsl();
});

bench('color2k', () => {
  parseToHsla('#66ccff');
});

bench('@ant-design/fast-color src', () => {
  new FastColor('#66ccff').toHsl();
});

bench('@ant-design/fast-color es', () => {
  new FastColorES('#66ccff').toHsl();
});
