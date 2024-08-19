/**
 * Force a hex value to have 2 characters
 * @hidden
 */
export function pad2(c: string): string {
  return c.length === 1 ? '0' + c : String(c);
}
