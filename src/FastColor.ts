import type { ColorInput, HSL, HSV, RGB } from './types';

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
      const trimed = input.trim();
      if (trimed[0] === '#') {
        this.fromHexString(trimed);
      } else if (trimed.startsWith('rgb')) {
        this.fromRgbString(trimed);
      } else if (trimed.startsWith('hsl')) {
        this.fromHslString(trimed);
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
      typeof this.r === 'number' &&
      this.r >= 0 &&
      this.r <= 255 &&
      typeof this.g === 'number' &&
      this.g >= 0 &&
      this.g <= 255 &&
      typeof this.b === 'number' &&
      this.b >= 0 &&
      this.b <= 255 &&
      typeof this.a === 'number' &&
      this.a >= 0 &&
      this.a <= 1
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

  onBackground(bg: FastColor): FastColor {
    const alpha = this.a + bg.a * (1 - this.a);

    return new FastColor({
      r: Math.round((this.r * this.a + bg.r * bg.a * (1 - this.a)) / alpha),
      g: Math.round((this.g * this.a + bg.g * bg.a * (1 - this.a)) / alpha),
      b: Math.round((this.b * this.a + bg.b * bg.a * (1 - this.a)) / alpha),
      a: alpha,
    });
  }

  setAlpha(alpha: number): void {
    this.a = alpha;
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

  private fromHexString(trimed: string) {
    if (trimed.length < 6) {
      // #rgb or #rgba
      this.r = parseInt(trimed[1] + trimed[1], 16);
      this.g = parseInt(trimed[2] + trimed[2], 16);
      this.b = parseInt(trimed[3] + trimed[3], 16);
      this.a = trimed[4] ? parseInt(trimed[4] + trimed[4], 16) / 255 : 1;
    } else {
      // #rrggbb or #rrggbbaa
      this.r = parseInt(trimed[1] + trimed[2], 16);
      this.g = parseInt(trimed[3] + trimed[4], 16);
      this.b = parseInt(trimed[5] + trimed[6], 16);
      this.a = trimed[8] ? parseInt(trimed[7] + trimed[8], 16) / 255 : 1;
    }
  }

  private fromHsl({ h, s, l, a }: HSL): void {
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

  private fromHsv({ h, s, v, a }: HSV): void {
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

  private fromHslString(trimed: string) {
    const str = trimed.substring(trimed.indexOf('(') + 1, trimed.indexOf(')'));
    const arr = str.includes(',')
      ? str.split(',')
      : str
          .replace('/', ' ')
          .split(' ')
          .filter((item) => item.length > 0);
    const h = parseInt(arr[0]);
    const s = parseFloat(arr[1]) / 100;
    const l = parseFloat(arr[2]) / 100;
    const a = arr[3]
      ? arr[3].includes('%')
        ? parseFloat(arr[3]) / 100
        : parseFloat(arr[3])
      : 1;
    this.fromHsl({ h, s, l, a });
  }

  private fromRgbString(trimed: string) {
    const str = trimed.substring(trimed.indexOf('(') + 1, trimed.indexOf(')'));
    const arr = str.includes(',')
      ? str.split(',')
      : str
          .replace('/', ' ')
          .split(' ')
          .filter((item) => item.length > 0);
    this.r = arr[0].includes('%')
      ? Math.round((parseFloat(arr[0]) / 100) * 255)
      : parseInt(arr[0]);
    this.g = arr[1].includes('%')
      ? Math.round((parseFloat(arr[1]) / 100) * 255)
      : parseInt(arr[1]);
    this.b = arr[2].includes('%')
      ? Math.round((parseFloat(arr[2]) / 100) * 255)
      : parseInt(arr[2]);
    this.a = arr[3]
      ? arr[3].includes('%')
        ? parseFloat(arr[3]) / 100
        : parseFloat(arr[3])
      : 1;
  }
}
