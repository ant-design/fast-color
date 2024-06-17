// Modified from https://github.com/scttcper/tinycolor/blob/master/test/index.spec.ts

import { FastColor as TinyColor } from '../src';

describe('TinyColor', () => {
  it('should init', () => {
    const r = new TinyColor('#66ccff');
    expect(r.toHexString()).toBe('#66ccff');
    expect(r).toBeTruthy();
  });

  it('should clone', () => {
    const color1 = new TinyColor('#66ccff');
    const color2 = new TinyColor('#66ccff').clone();
    color2.setAlpha(0.5);
    expect(color2.isValid).toBeTruthy();
    expect(color2.toString()).toBe('rgba(255,0,0,0.5)');
    expect(color1.toString()).toBe('red');
  });

  it('should parse hex', () => {
    expect(new TinyColor('#000').toHexString()).toBe('#000000');
    expect(new TinyColor('#0000').toHexString()).toBe('#000000');
    expect(new TinyColor('#000').getAlpha()).toBe(1);
    // Not sure this is expected behavior
    expect(new TinyColor('#0000').getAlpha()).toBe(0);
  });

  it('should parse rgb', () => {
    // spaced input
    expect(new TinyColor('rgb 255 0 0').toHexString()).toBe('#ff0000');
    // parenthesized input
    expect(new TinyColor('rgb(255,0,0)').toHexString()).toBe('#ff0000');
    // parenthesized spaced input
    expect(new TinyColor('rgb (255,0,0)').toHexString()).toBe('#ff0000');
    // object input
    expect(new TinyColor({ r: 255, g: 0, b: 0 }).toHexString()).toBe('#ff0000');
    // object input and compare
    expect(new TinyColor({ r: 255, g: 0, b: 0 }).toRgb()).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });

    expect(
      new TinyColor({ r: 200, g: 100, b: 0 }).equals(
        new TinyColor('rgb(200, 100, 0)'),
      ),
    ).toBe(true);
    expect(
      new TinyColor({ r: 200, g: 100, b: 0, a: 0.4 }).equals(
        new TinyColor('rgba 200 100 0 .4'),
      ),
    ).toBe(true);

    expect(
      new TinyColor({ r: 199, g: 100, b: 0 }).equals(
        new TinyColor({ r: 200, g: 100, b: 0 }),
      ),
    ).toBe(false);

    expect(
      new TinyColor({ r: 199, g: 100, b: 0 }).equals(
        new TinyColor({ r: 200, g: 100, b: 0 }),
      ),
    ).toBe(false);
  });

  it('should parse percentage rgb text', () => {
    // spaced input
    expect(new TinyColor('rgb 100% 0% 0%').toHexString()).toBe('#ff0000');
    // parenthesized input
    expect(new TinyColor('rgb(100%, 0%, 0%)').toHexString()).toBe('#ff0000');
    // parenthesized spaced input
    expect(new TinyColor('rgb (100%, 0%, 0%)').toHexString()).toBe('#ff0000');
  });

  it('should parse HSL', () => {
    // to hex
    expect(new TinyColor({ h: 251, s: 100, l: 0.38 }).toHexString()).toBe(
      '#2400c2',
    );
    // to rgb
    expect(new TinyColor({ h: 251, s: 100, l: 0.38 }).toRgbString()).toBe(
      'rgb(36,0,194)',
    );
    // to hsl
    expect(new TinyColor({ h: 251, s: 100, l: 0.38 }).toHslString()).toBe(
      'hsl(251,100%,38%)',
    );
    expect(
      new TinyColor({ h: 251, s: 100, l: 0.38, a: 0.38 }).toHslString(),
    ).toBe('hsla(251,100%,38%, 0.38)');
    // to hex
    expect(new TinyColor('hsl(251,100,38)').toHexString()).toBe('#2400c2');
    // to rgb
    expect(new TinyColor('hsl(251,100%,38%)').toRgbString()).toBe(
      'rgb(36,0,194)',
    );
    // to hsl
    expect(new TinyColor('hsl(251,100%,38%)').toHslString()).toBe(
      'hsl(251,100%,38%)',
    );
    // problematic hsl
    expect(new TinyColor('hsl 100 20 10').toHslString()).toBe(
      'hsl(100, 20%, 10%)',
    );
    expect(new TinyColor('hsla 100 20 10 0.38').toHslString()).toBe(
      'hsla(100, 20%, 10%, 0.38)',
    );
    // wrap out of bounds hue
    expect(new TinyColor('hsl -700 20 10').toHslString()).toBe(
      'hsl(20, 20%, 10%)',
    );
    expect(new TinyColor('hsl -490 100% 50%').toHslString()).toBe(
      'hsl(230, 100%, 50%)',
    );
  });

  it('should parse invalid input', () => {
    let invalidColor = new TinyColor('not a color');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);

    invalidColor = new TinyColor('#red');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);

    invalidColor = new TinyColor('  #red');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);

    invalidColor = new TinyColor('##123456');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);

    invalidColor = new TinyColor('  ##123456');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);

    invalidColor = new TinyColor({
      r: 'invalid',
      g: 'invalid',
      b: 'invalid',
    } as any);

    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);

    invalidColor = new TinyColor({
      h: 'invalid',
      s: 'invalid',
      l: 'invalid',
    } as any);
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);

    invalidColor = new TinyColor({
      h: 'invalid',
      s: 'invalid',
      v: 'invalid',
    } as any);
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);

    invalidColor = new TinyColor(null);
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid).toBe(false);
  });

  it('Invalid alpha should normalize to 1', () => {
    // Negative value
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: -1 }).toRgbString()).toBe(
      'rgb(255,20,10)',
    );
    // Negative 0
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: -0 }).toRgbString()).toBe(
      'rgba(255,20,10, 0)',
    );
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 0 }).toRgbString()).toBe(
      'rgba(255,20,10, 0)',
    );
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 0.5 }).toRgbString()).toBe(
      'rgba(255,20,10, 0.5)',
    );
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 1 }).toRgbString()).toBe(
      'rgb(255,20,10)',
    );
    // Greater than 1
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 100 }).toRgbString()).toBe(
      'rgb(255,20,10)',
    );
    // Non Numeric
    expect(
      new TinyColor({
        r: 255,
        g: 20,
        b: 10,
        a: 'asdfasd',
      } as any).toRgbString(),
    ).toBe('rgb(255,20,10)');

    expect(new TinyColor('#fff').toRgbString()).toBe('rgb(255, 255, 255)');
    // Greater than 1 in string parsing
    expect(new TinyColor('rgba 255 0 0 100').toRgbString()).toBe(
      'rgb(255,0,0)',
    );
  });

  it('should get alpha', () => {
    const hexSetter = new TinyColor('rgba(255,0,0,1)');
    // Alpha should start as 1
    expect(hexSetter.getAlpha()).toBe(1);
    hexSetter.setAlpha(0.9);
    // setAlpha should change alpha value
    expect(hexSetter.getAlpha()).toBe(0.9);
    hexSetter.setAlpha(0.5);
    // setAlpha should change alpha value
    expect(hexSetter.getAlpha()).toBe(0.5);
  });

  it('should set alpha', () => {
    const hexSetter = new TinyColor('rgba(255,0,0,1)');
    // Alpha should start as 1
    expect(hexSetter.a).toBe(1);
    const returnedFromSetAlpha = hexSetter.setAlpha(0.9);
    // setAlpha return value should be the color
    expect(returnedFromSetAlpha).toBe(hexSetter);
    // setAlpha should change alpha value
    expect(hexSetter.a).toBe(0.9);
    hexSetter.setAlpha(0.5);
    // setAlpha should change alpha value
    expect(hexSetter.a).toBe(0.5);
    hexSetter.setAlpha(0);
    // setAlpha should change alpha value
    expect(hexSetter.a).toBe(0);
    hexSetter.setAlpha(-1);
    // setAlpha with value < 0 should be bound to 1
    expect(hexSetter.a).toBe(1);
    hexSetter.setAlpha(2);
    // setAlpha with value > 1 should be bound to 1
    expect(hexSetter.a).toBe(1);
    hexSetter.setAlpha(undefined);
    // setAlpha with invalid value should be bound to 1
    expect(hexSetter.a).toBe(1);
    hexSetter.setAlpha(null as any);
    // setAlpha with invalid value should be bound to 1
    expect(hexSetter.a).toBe(1);
    hexSetter.setAlpha('test' as any);
    // setAlpha with invalid value should be bound to 1
    expect(hexSetter.a).toBe(1);
  });

  it('should getBrightness', () => {
    expect(new TinyColor('#000').getBrightness()).toBe(0);
    expect(new TinyColor('#fff').getBrightness()).toBe(255);
  });

  it('should getLuminance', () => {
    expect(new TinyColor('#000').getLuminance()).toBe(0);
    expect(new TinyColor('#fff').getLuminance()).toBe(1);
  });

  it('isDark returns true/false for dark/light colors', () => {
    expect(new TinyColor('#000').isDark()).toBe(true);
    expect(new TinyColor('#111').isDark()).toBe(true);
    expect(new TinyColor('#222').isDark()).toBe(true);
    expect(new TinyColor('#333').isDark()).toBe(true);
    expect(new TinyColor('#444').isDark()).toBe(true);
    expect(new TinyColor('#555').isDark()).toBe(true);
    expect(new TinyColor('#666').isDark()).toBe(true);
    expect(new TinyColor('#777').isDark()).toBe(true);
    expect(new TinyColor('#888').isDark()).toBe(false);
    expect(new TinyColor('#999').isDark()).toBe(false);
    expect(new TinyColor('#aaa').isDark()).toBe(false);
    expect(new TinyColor('#bbb').isDark()).toBe(false);
    expect(new TinyColor('#ccc').isDark()).toBe(false);
    expect(new TinyColor('#ddd').isDark()).toBe(false);
    expect(new TinyColor('#eee').isDark()).toBe(false);
    expect(new TinyColor('#fff').isDark()).toBe(false);
  });
  it('isLight returns true/false for light/dark colors', () => {
    expect(new TinyColor('#000').isLight()).toBe(false);
    expect(new TinyColor('#111').isLight()).toBe(false);
    expect(new TinyColor('#222').isLight()).toBe(false);
    expect(new TinyColor('#333').isLight()).toBe(false);
    expect(new TinyColor('#444').isLight()).toBe(false);
    expect(new TinyColor('#555').isLight()).toBe(false);
    expect(new TinyColor('#666').isLight()).toBe(false);
    expect(new TinyColor('#777').isLight()).toBe(false);
    expect(new TinyColor('#888').isLight()).toBe(true);
    expect(new TinyColor('#999').isLight()).toBe(true);
    expect(new TinyColor('#aaa').isLight()).toBe(true);
    expect(new TinyColor('#bbb').isLight()).toBe(true);
    expect(new TinyColor('#ccc').isLight()).toBe(true);
    expect(new TinyColor('#ddd').isLight()).toBe(true);
    expect(new TinyColor('#eee').isLight()).toBe(true);
    expect(new TinyColor('#fff').isLight()).toBe(true);
  });

  it('Color equality', () => {
    expect(new TinyColor('#ff0000').equals(new TinyColor('#ff0000'))).toBe(
      true,
    );
    expect(new TinyColor('#ff0000').equals(new TinyColor('rgb(255,0,0)'))).toBe(
      true,
    );
    expect(
      new TinyColor('#ff0000').equals(new TinyColor('rgba(255,0,0,.1)')),
    ).toBe(false);
    expect(
      new TinyColor('#ff000066').equals(new TinyColor('rgba(255,0,0,.4)')),
    ).toBe(true);
    expect(
      new TinyColor('#f009').equals(new TinyColor('rgba(255,0,0,.6)')),
    ).toBe(true);
    expect(new TinyColor('#336699CC').equals(new TinyColor('#369C'))).toBe(
      true,
    );
    expect(new TinyColor('#f00').equals(new TinyColor('#ff0000'))).toBe(true);
    expect(new TinyColor('#f00').equals(new TinyColor('#ff0000'))).toBe(true);
    expect(new TinyColor('#ff0000').equals(new TinyColor('#00ff00'))).toBe(
      false,
    );
    expect(
      new TinyColor('#ff8000').equals(new TinyColor('rgb(100%, 50%, 0%)')),
    ).toBe(true);
  });

  it('onBackground', () => {
    expect(
      new TinyColor('#ffffff')
        .onBackground(new TinyColor('#000'))
        .toHexString(),
    ).toBe('#ffffff');
    expect(
      new TinyColor('#ffffff00')
        .onBackground(new TinyColor('#000'))
        .toHexString(),
    ).toBe('#000000');
    expect(
      new TinyColor('#ffffff77')
        .onBackground(new TinyColor('#000'))
        .toHexString(),
    ).toBe('#777777');
    expect(
      new TinyColor('#262a6d82')
        .onBackground(new TinyColor('#644242'))
        .toHexString(),
    ).toBe('#443658');
    expect(
      new TinyColor('rgba(255,0,0,0.5)')
        .onBackground(new TinyColor('rgba(0,255,0,0.5)'))
        .toRgbString(),
    ).toBe('rgba(170,85,0,0.75)');
    expect(
      new TinyColor('rgba(255,0,0,0.5)')
        .onBackground(new TinyColor('rgba(0,0,255,1)'))
        .toRgbString(),
    ).toBe('rgb(128,0,128)');
    expect(
      new TinyColor('rgba(0,0,255,1)')
        .onBackground(new TinyColor('rgba(0,0,0,0.5)'))
        .toRgbString(),
    ).toBe('rgb(0,0,255)');
  });
});
