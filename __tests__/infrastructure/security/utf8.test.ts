import { utf8Decode, utf8Encode } from '@/infrastructure/security/utf8';

describe('UTF-8', () => {
  it.each(['Spinning', 'Valentina Ríos · Julián Mejía · Laura Gómez · ñ', 'Precio: 5€', '💪 Rumba', ''])(
    'codifica y decodifica ida y vuelta: "%s"',
    (text) => {
      expect(utf8Decode(utf8Encode(text))).toBe(text);
    },
  );

  it('produce los mismos bytes que el estándar', () => {
    const text = 'Ríos 💪';

    expect([...utf8Encode(text)]).toEqual([...Buffer.from(text, 'utf8')]);
  });

  it('rechaza secuencias UTF-8 inválidas', () => {
    expect(() => utf8Decode(Uint8Array.from([0xc3]))).toThrow(RangeError);
    expect(() => utf8Decode(Uint8Array.from([0xff]))).toThrow(RangeError);
    expect(() => utf8Decode(Uint8Array.from([0xe0, 0x80, 0x80]))).toThrow(RangeError);
  });
});
