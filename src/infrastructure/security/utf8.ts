/**
 * Strict UTF-8 codec. expo-crypto treats strings as base64, so text must be converted to bytes;
 * this avoids depending on TextEncoder/TextDecoder support in each JavaScript engine.
 */
export function utf8Encode(text: string): Uint8Array {
  const bytes: number[] = [];
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint < 0x80) bytes.push(codePoint);
    else if (codePoint < 0x800) bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    else if (codePoint < 0x10000) {
      bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }
  return Uint8Array.from(bytes);
}

const sequence = (lead: number): { extra: number; bits: number; min: number } | undefined => {
  if (lead < 0x80) return { extra: 0, bits: lead, min: 0 };
  if ((lead & 0xe0) === 0xc0) return { extra: 1, bits: lead & 0x1f, min: 0x80 };
  if ((lead & 0xf0) === 0xe0) return { extra: 2, bits: lead & 0x0f, min: 0x800 };
  if ((lead & 0xf8) === 0xf0) return { extra: 3, bits: lead & 0x07, min: 0x10000 };
  return undefined;
};

export function utf8Decode(bytes: Uint8Array): string {
  let text = '';
  let index = 0;
  while (index < bytes.length) {
    const head = sequence(bytes[index] ?? 0);
    if (!head) throw new RangeError('Invalid UTF-8');
    let codePoint = head.bits;
    for (let offset = 1; offset <= head.extra; offset += 1) {
      const next = bytes[index + offset];
      if (next === undefined || (next & 0xc0) !== 0x80) throw new RangeError('Invalid UTF-8');
      codePoint = (codePoint << 6) | (next & 0x3f);
    }
    if (codePoint < head.min || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
      throw new RangeError('Invalid UTF-8');
    }
    text += String.fromCodePoint(codePoint);
    index += head.extra + 1;
  }
  return text;
}
