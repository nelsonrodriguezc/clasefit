import { AESEncryptionKey, AESKeySize } from 'expo-crypto';

import { ExpoAesGcmCipher } from '@/infrastructure/security/ExpoAesGcmCipher';
import { IntegrityError } from '@/infrastructure/security/IntegrityError';

const cipherWith = (key: AESEncryptionKey) => new ExpoAesGcmCipher({ getKey: async () => key });

describe('ExpoAesGcmCipher (AES-256-GCM)', () => {
  let key: AESEncryptionKey;

  beforeEach(async () => {
    key = await AESEncryptionKey.generate(AESKeySize.AES256);
  });

  it('sella y abre ida y vuelta texto con tildes', async () => {
    const cipher = cipherWith(key);

    const sealed = await cipher.seal('Yoga con Valentina Ríos', 'slot');

    expect(await cipher.open(sealed, 'slot')).toBe('Yoga con Valentina Ríos');
  });

  it('el resultado es base64 y no contiene el texto en claro', async () => {
    const sealed = await cipherWith(key).seal('Yoga con Valentina Ríos', 'slot');

    expect(sealed).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(Buffer.from(sealed, 'base64').toString('latin1')).not.toContain('Yoga');
  });

  it('usa un nonce distinto en cada sellado: el mismo texto produce resultados distintos', async () => {
    const cipher = cipherWith(key);

    expect(await cipher.seal('mismo', 'slot')).not.toBe(await cipher.seal('mismo', 'slot'));
  });

  it('rechaza con IntegrityError un texto cifrado alterado', async () => {
    const cipher = cipherWith(key);
    const bytes = Buffer.from(await cipher.seal('reserva', 'slot'), 'base64');
    bytes[bytes.length - 1] = (bytes[bytes.length - 1] ?? 0) ^ 0x01;

    await expect(cipher.open(bytes.toString('base64'), 'slot')).rejects.toBeInstanceOf(IntegrityError);
  });

  it('rechaza con IntegrityError datos asociados distintos (contenido trasplantado de ranura)', async () => {
    const cipher = cipherWith(key);
    const sealed = await cipher.seal('reserva', 'slot-a');

    await expect(cipher.open(sealed, 'slot-b')).rejects.toBeInstanceOf(IntegrityError);
  });

  it('rechaza con IntegrityError un contenido cifrado con otra llave', async () => {
    const sealed = await cipherWith(key).seal('reserva', 'slot');
    const otherKey = await AESEncryptionKey.generate(AESKeySize.AES256);

    await expect(cipherWith(otherKey).open(sealed, 'slot')).rejects.toBeInstanceOf(IntegrityError);
  });

  it('rechaza con IntegrityError un contenido demasiado corto o que no es base64', async () => {
    await expect(cipherWith(key).open('YWJj', 'slot')).rejects.toBeInstanceOf(IntegrityError);
  });

  it('propaga la falla del proveedor de llaves sin disfrazarla de alteración', async () => {
    const cipher = new ExpoAesGcmCipher({ getKey: async () => Promise.reject(new Error('keystore locked')) });

    await expect(cipher.open('YWJj', 'slot')).rejects.toThrow('keystore locked');
    await expect(cipher.seal('x', 'slot')).rejects.toThrow('keystore locked');
  });
});
