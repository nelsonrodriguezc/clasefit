/**
 * Strict Base64 (RFC 4648, standard alphabet, with padding). The cipher stores the sealed bytes as
 * Base64 text and decodes them itself: expo-crypto's Android implementation of
 * AESSealedData.fromCombined only accepts bytes, although its typings also allow a Base64 string.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const VALID = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const [a = 0, b = 0, c = 0] = [bytes[index], bytes[index + 1], bytes[index + 2]];
    const chunk = (a << 16) | (b << 8) | c;
    const remaining = bytes.length - index;
    output += ALPHABET[(chunk >> 18) & 63];
    output += ALPHABET[(chunk >> 12) & 63];
    output += remaining > 1 ? ALPHABET[(chunk >> 6) & 63] : '=';
    output += remaining > 2 ? ALPHABET[chunk & 63] : '=';
  }
  return output;
}

export function base64ToBytes(value: string): Uint8Array {
  if (!VALID.test(value)) throw new RangeError('Invalid Base64');
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  const bytes = new Uint8Array((value.length / 4) * 3 - padding);
  let position = 0;
  for (let index = 0; index < value.length; index += 4) {
    const chunk =
      (ALPHABET.indexOf(value.charAt(index)) << 18) |
      (ALPHABET.indexOf(value.charAt(index + 1)) << 12) |
      ((ALPHABET.indexOf(value.charAt(index + 2)) & 63) << 6) |
      (ALPHABET.indexOf(value.charAt(index + 3)) & 63);
    for (const shift of [16, 8, 0]) {
      if (position < bytes.length) bytes[position++] = (chunk >> shift) & 255;
    }
  }
  return bytes;
}
