import { pad2 } from './util';

export function rgbaToHex(
  r: number,
  g: number,
  b: number,
  a: number,
  allow4Char: boolean,
): string {
  const hex = [
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16)),
    pad2(convertDecimalToHex(a)),
  ];

  // Return a 4 character hex if possible
  if (
    allow4Char &&
    hex[0].startsWith(hex[0].charAt(1)) &&
    hex[1].startsWith(hex[1].charAt(1)) &&
    hex[2].startsWith(hex[2].charAt(1)) &&
    hex[3].startsWith(hex[3].charAt(1))
  ) {
    return (
      hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0)
    );
  }

  return hex.join('');
}

/** Converts a decimal to a hex value */
export function convertDecimalToHex(d: string | number): string {
  return Math.round(parseFloat(d as string) * 255).toString(16);
}
