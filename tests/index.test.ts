import { FastColor } from '../src';

describe('index', () => {
  it('mix should round', () => {
    const source = new FastColor('rgba(255, 255, 255, 0.1128)');
    const target = new FastColor('rgba(0, 0, 0, 0.93)');

    const mixed = source.mix(target, 50);

    expect(mixed.toRgbString()).toBe('rgba(128,128,128,0.52)');
  });

  it('preset color', () => {
    const red = new FastColor('red');
    expect(red.toRgbString()).toBe('rgb(255,0,0)');

    const whitesmoke = new FastColor('whitesmoke');
    expect(whitesmoke.toHexString()).toBe('#f5f5f5');
  });
});
