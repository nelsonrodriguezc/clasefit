import { base64ToBytes, bytesToBase64 } from '@/infrastructure/security/base64';

const ascii = (text: string) => Uint8Array.from(text, (char) => char.charCodeAt(0));

describe('Base64 (RFC 4648)', () => {
  it.each([
    ['', ''],
    ['f', 'Zg=='],
    ['fo', 'Zm8='],
    ['foo', 'Zm9v'],
    ['foob', 'Zm9vYg=='],
    ['fooba', 'Zm9vYmE='],
    ['foobar', 'Zm9vYmFy'],
  ])('codifica y decodifica el vector "%s" ↔ "%s"', (text, encoded) => {
    expect(bytesToBase64(ascii(text))).toBe(encoded);
    expect([...base64ToBytes(encoded)]).toEqual([...ascii(text)]);
  });

  it('ida y vuelta con todos los valores de byte', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index);

    expect([...base64ToBytes(bytesToBase64(bytes))]).toEqual([...bytes]);
    expect(bytesToBase64(bytes)).toBe(Buffer.from(bytes).toString('base64'));
  });

  it.each(['Zm9v!', 'Zm9', 'Zm9v====', '=Zm9', 'Zm 9v'])('rechaza la entrada inválida "%s"', (value) => {
    expect(() => base64ToBytes(value)).toThrow(RangeError);
  });
});
