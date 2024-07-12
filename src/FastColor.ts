import type { ColorInput, HSL, HSV, OptionalA, RGB } from './types';

type ParseNumber = (num: number, txt: string, index: number) => number;

/**
 * Support format, alpha unit will check the % mark:
 * - rgba(102, 204, 255, .5)      -> [102, 204, 255, 0.5]
 * - rgb(102 204 255 / .5)        -> [102, 204, 255, 0.5]
 * - rgb(100%, 50%, 0% / 50%)     -> [255, 128, 0, 0.5]
 * - hsl(270, 60, 40, .5)         -> [270, 60, 40, 0.5]
 * - hsl(270deg 60% 40% / 50%)   -> [270, 60, 40, 0.5]
 *
 * When `base` is provided, the percentage value will be divided by `base`.
 */
function splitColorStr(str: string, parseNum: ParseNumber): number[] {
  const match: string[] =
    str
      // Remove str before `(`
      .replace(/^[^(]*\((.*)/, '$1')
      // Remove str after `)`
      .replace(/\).*/, '')
      .match(/\d*\.?\d+%?/g) || [];
  const numList = match.map((item) => parseFloat(item));

  for (let i = 0; i < 3; i += 1) {
    numList[i] = parseNum(numList[i] || 0, match[i] || '', i);
  }

  // For alpha. 50% should be 0.5
  if (match[3]) {
    numList[3] = match[3].includes('%') ? numList[3] / 100 : numList[3];
  } else {
    // By default, alpha is 1
    numList[3] = 1;
  }

  return numList;
}

function inRange(val: number, max = 255, min = 0) {
  return typeof val === 'number' && val >= min && val <= max;
}

const parseHSVorHSL: ParseNumber = (num, _, index) =>
  index === 0 ? num : num / 100;

export class FastColor {
  /**
   * Red, R in RGB
   */
  r: number;
  /**
   * Green, G in RGB
   */
  g: number;
  /**
   * Blue, B in RGB
   */
  b: number;
  /**
   * Alpha/Opacity, A in RGBA/HSLA
   */
  a: number;

  // HSV privates
  private _h?: number;
  private _s?: number;
  private _l?: number;
  private _v?: number;

  // intermedia variables to calculate HSL/HSV
  private _max?: number;
  private _min?: number;

  private _brightness?: number;

  constructor(input: ColorInput) {
    if (typeof input === 'string') {
      const trimStr = input.trim();

      function matchPrefix(prefix: string) {
        return trimStr.startsWith(prefix);
      }

      if (/^#?[A-F\d]{3,8}$/i.test(trimStr)) {
        this.fromHexString(trimStr);
      } else if (matchPrefix('rgb')) {
        this.fromRgbString(trimStr);
      } else if (matchPrefix('hsl')) {
        this.fromHslString(trimStr);
      } else if (matchPrefix('hsv') || matchPrefix('hsb')) {
        this.fromHsvString(trimStr);
      }
    } else if ('r' in input && 'g' in input && 'b' in input) {
      this.r = input.r;
      this.g = input.g;
      this.b = input.b;
      this.a = typeof input.a === 'number' ? input.a : 1;
    } else if ('l' in input && 'h' in input && 's' in input) {
      this.fromHsl(input);
    } else if ('v' in input && 'h' in input && 's' in input) {
      this.fromHsv(input);
    } else {
      throw new Error(
        '@ant-design/fast-color: unsupported input ' + JSON.stringify(input),
      );
    }
  }

  /**
   * Hue, H in HSL/HSV
   */
  get h() {
    return this.getHue();
  }

  /**
   * Saturation, S in HSL/HSV
   */
  get s() {
    return this.getSaturation();
  }

  /**
   * Lightness, L in HSL
   */
  get l() {
    return this.getLightness();
  }

  /**
   * Value, V in HSV
   */
  get v() {
    return this.getValue();
  }

  get isValid() {
    return (
      inRange(this.r) &&
      inRange(this.g) &&
      inRange(this.b) &&
      inRange(this.a, 1)
    );
  }

  clone(): FastColor {
    return new FastColor(this);
  }

  equals(other: FastColor): boolean {
    return (
      this.r === other.r &&
      this.g === other.g &&
      this.b === other.b &&
      this.a === other.a
    );
  }

  darken(amount = 10): FastColor {
    const h = this.getHue();
    const s = this.getSaturation();
    let l = this.getLightness() - amount / 100;
    if (l < 0) {
      l = 0;
    }
    return new FastColor({ h, s, l, a: this.a });
  }

  lighten(amount = 10): FastColor {
    const h = this.getHue();
    const s = this.getSaturation();
    let l = this.getLightness() + amount / 100;
    if (l > 1) {
      l = 1;
    }
    return new FastColor({ h, s, l, a: this.a });
  }

  /**
   * Mix the color with pure white, from 0 to 100.
   * Providing 0 will do nothing, providing 100 will always return white.
   */
  tint(amount = 10): FastColor {
    return this.mix({ r: 255, g: 255, b: 255, a: 1 }, amount);
  }

  /**
   * Mix the color with pure black, from 0 to 100.
   * Providing 0 will do nothing, providing 100 will always return black.
   */
  shade(amount = 10): FastColor {
    return this.mix({ r: 0, g: 0, b: 0, a: 1 }, amount);
  }

  /**
   * Mix the current color a given amount with another color, from 0 to 100.
   * 0 means no mixing (return current color).
   */
  mix(color: ColorInput, amount = 50): FastColor {
    const rgb1 = this.toRgb();
    const rgb2 = new FastColor(color).toRgb();

    const p = amount / 100;
    const rgba = {
      r: (rgb2.r - rgb1.r) * p + rgb1.r,
      g: (rgb2.g - rgb1.g) * p + rgb1.g,
      b: (rgb2.b - rgb1.b) * p + rgb1.b,
      a: (rgb2.a - rgb1.a) * p + rgb1.a,
    };

    return new FastColor(rgba);
  }

  getAlpha(): number {
    return this.a;
  }

  /**
   * Returns the perceived luminance of a color, from 0-1.
   * @see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
   */
  getLuminance(): number {
    let R;
    let G;
    let B;
    const RsRGB = this.r / 255;
    const GsRGB = this.g / 255;
    const BsRGB = this.b / 255;

    if (RsRGB <= 0.03928) {
      R = RsRGB / 12.92;
    } else {
      R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
    }

    if (GsRGB <= 0.03928) {
      G = GsRGB / 12.92;
    } else {
      G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
    }

    if (BsRGB <= 0.03928) {
      B = BsRGB / 12.92;
    } else {
      B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
    }

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  getHue(): number {
    if (typeof this._h === 'undefined') {
      const delta = this.max - this.min;
      if (delta === 0) {
        this._h = 0;
      } else {
        this._h = Math.round(
          60 *
            (this.r === this.max
              ? (this.g - this.b) / delta + (this.g < this.b ? 6 : 0)
              : this.g === this.max
              ? (this.b - this.r) / delta + 2
              : (this.r - this.g) / delta + 4),
        );
      }
    }
    return this._h;
  }

  getSaturation(): number {
    if (typeof this._s === 'undefined') {
      const delta = this.max - this.min;
      if (delta === 0) {
        this._s = 0;
      } else {
        this._s = delta / this.max;
      }
    }
    return this._s;
  }

  getLightness(): number {
    if (typeof this._l === 'undefined') {
      this._l = (this.max + this.min) / 510;
    }
    return this._l;
  }

  getValue(): number {
    if (typeof this._v === 'undefined') {
      this._v = this.max / 255;
    }
    return this._v;
  }

  isDark(): boolean {
    return this.getBrightness() < 128;
  }

  isLight(): boolean {
    return this.getBrightness() >= 128;
  }

  /**
   * Returns the perceived brightness of the color, from 0-255.
   * @see http://www.w3.org/TR/AERT#color-contrast
   */
  getBrightness(): number {
    if (typeof this._brightness === 'undefined') {
      this._brightness = (this.r * 299 + this.g * 587 + this.b * 114) / 1000;
    }
    return this._brightness;
  }

  onBackground(background: ColorInput): FastColor {
    const bg = new FastColor(background);
    const alpha = this.a + bg.a * (1 - this.a);

    return new FastColor({
      r: Math.round((this.r * this.a + bg.r * bg.a * (1 - this.a)) / alpha),
      g: Math.round((this.g * this.a + bg.g * bg.a * (1 - this.a)) / alpha),
      b: Math.round((this.b * this.a + bg.b * bg.a * (1 - this.a)) / alpha),
      a: alpha,
    });
  }

  setAlpha(alpha: number): FastColor {
    this.a = alpha;
    return this;
  }

  toHexString(): string {
    let hex = '#';
    const rHex = (this.r || 0).toString(16);
    hex += rHex.length === 2 ? rHex : '0' + rHex;
    const gHex = (this.g || 0).toString(16);
    hex += gHex.length === 2 ? gHex : '0' + gHex;
    const bHex = (this.b || 0).toString(16);
    hex += bHex.length === 2 ? bHex : '0' + bHex;
    if (typeof this.a === 'number' && this.a >= 0 && this.a < 1) {
      const aHex = Math.round(this.a * 255).toString(16);
      hex += aHex.length === 2 ? aHex : '0' + aHex;
    }
    return hex;
  }

  toHsl(): HSL {
    return {
      h: this.h,
      s: this.s,
      l: this.l,
      a: this.a,
    };
  }

  toHslString(): string {
    const h = this.h;
    const s = Math.round(this.s * 100);
    const l = Math.round(this.l * 100);

    return this.a !== 1
      ? `hsla(${h},${s}%,${l}%,${this.a})`
      : `hsl(${h},${s}%,${l}%)`;
  }

  toHsv(): HSV {
    return {
      h: this.h,
      s: this.s,
      v: this.v,
      a: this.a,
    };
  }

  toRgb(): RGB {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a,
    };
  }

  toRgbString(): string {
    return this.a !== 1
      ? `rgba(${this.r},${this.g},${this.b},${this.a})`
      : `rgb(${this.r},${this.g},${this.b})`;
  }

  toString(): string {
    return this.toRgbString();
  }

  private get max() {
    if (typeof this._max === 'undefined') {
      this._max = Math.max(this.r, this.g, this.b);
    }
    return this._max;
  }

  private get min() {
    if (typeof this._min === 'undefined') {
      this._min = Math.min(this.r, this.g, this.b);
    }
    return this._min;
  }

  private fromHexString(trimStr: string) {
    const withoutPrefix = trimStr.replace('#', '');

    function connectNum(index1: number, index2?: number) {
      return parseInt(
        withoutPrefix[index1] + withoutPrefix[index2 || index1],
        16,
      );
    }

    if (withoutPrefix.length < 6) {
      // #rgb or #rgba
      this.r = connectNum(0);
      this.g = connectNum(1);
      this.b = connectNum(2);
      this.a = withoutPrefix[3] ? connectNum(3) / 255 : 1;
    } else {
      // #rrggbb or #rrggbbaa
      this.r = connectNum(0, 1);
      this.g = connectNum(2, 3);
      this.b = connectNum(4, 5);
      this.a = withoutPrefix[6] ? connectNum(6, 7) / 255 : 1;
    }
  }

  private fromHsl({ h, s, l, a }: OptionalA<HSL>): void {
    this._h = h % 360;
    this._s = s;
    this._l = l;
    this.a = typeof a === 'number' ? a : 1;

    if (s <= 0) {
      const rgb = Math.round(l * 255);
      this.r = rgb;
      this.g = rgb;
      this.b = rgb;
    }

    const huePrime = h / 60;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    this.r = 0;
    this.g = 0;
    this.b = 0;

    if (huePrime >= 0 && huePrime < 1) {
      this.r = chroma;
      this.g = secondComponent;
    } else if (huePrime >= 1 && huePrime < 2) {
      this.r = secondComponent;
      this.g = chroma;
    } else if (huePrime >= 2 && huePrime < 3) {
      this.g = chroma;
      this.b = secondComponent;
    } else if (huePrime >= 3 && huePrime < 4) {
      this.g = secondComponent;
      this.b = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
      this.r = secondComponent;
      this.b = chroma;
    } else if (huePrime >= 5 && huePrime < 6) {
      this.r = chroma;
      this.b = secondComponent;
    }

    const lightnessModification = l - chroma / 2;
    this.r = Math.round((this.r + lightnessModification) * 255);
    this.g = Math.round((this.g + lightnessModification) * 255);
    this.b = Math.round((this.b + lightnessModification) * 255);
  }

  private fromHsv({ h, s, v, a }: OptionalA<HSV>): void {
    this._h = h % 360;
    this._s = s;
    this._v = v;
    this.a = typeof a === 'number' ? a : 1;

    const vv = Math.round(v * 255);
    this.r = vv;
    this.g = vv;
    this.b = vv;

    if (s <= 0) {
      return;
    }

    const hh = h / 60;
    const i = Math.floor(hh);
    const ff = hh - i;
    const p = Math.round(v * (1.0 - s) * 255);
    const q = Math.round(v * (1.0 - s * ff) * 255);
    const t = Math.round(v * (1.0 - s * (1.0 - ff)) * 255);

    switch (i) {
      case 0:
        this.g = t;
        this.b = p;
        break;
      case 1:
        this.r = q;
        this.b = p;
        break;
      case 2:
        this.r = p;
        this.b = t;
        break;
      case 3:
        this.r = p;
        this.g = q;
        break;
      case 4:
        this.r = t;
        this.g = p;
        break;
      case 5:
      default:
        this.g = p;
        this.b = q;
        break;
    }
  }

  private fromHsvString(trimed: string) {
    const cells = splitColorStr(trimed, parseHSVorHSL);

    this.fromHsv({
      h: cells[0],
      s: cells[1],
      v: cells[2],
      a: cells[3],
    });
  }

  private fromHslString(trimed: string) {
    const cells = splitColorStr(trimed, parseHSVorHSL);

    this.fromHsl({
      h: cells[0],
      s: cells[1],
      l: cells[2],
      a: cells[3],
    });
  }

  private fromRgbString(trimed: string) {
    const cells = splitColorStr(trimed, (num, txt) =>
      // Convert percentage to number. e.g. 50% -> 128
      txt.includes('%') ? Math.round((num / 100) * 255) : num,
    );

    this.r = cells[0];
    this.g = cells[1];
    this.b = cells[2];
    this.a = cells[3];
  }
}
