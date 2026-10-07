import AsyncStorage from '@react-native-async-storage/async-storage';
import { AESEncryptionKey, AESKeySize, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { secureStoreMock } from '../support/mocks';

// These doubles replace native modules in Jest. They must behave like the real ones,
// otherwise the adapter tests would prove nothing.
describe('Dobles de módulos nativos', () => {
  const utf8 = (text: string) => new Uint8Array(Buffer.from(text, 'utf8'));

  describe('expo-crypto (AES-GCM real sobre WebCrypto de Node)', () => {
    it('cifra y descifra ida y vuelta con datos asociados', async () => {
      const key = await AESEncryptionKey.generate(AESKeySize.AES256);
      const sealed = await aesEncryptAsync(utf8('reserva'), key, { nonce: { length: 12 }, additionalData: utf8('aad') });

      const opened = await aesDecryptAsync(sealed, key, { additionalData: utf8('aad') });

      expect(Buffer.from(opened).toString('utf8')).toBe('reserva');
    });

    it('rechaza el descifrado si el texto cifrado fue alterado', async () => {
      const key = await AESEncryptionKey.generate(AESKeySize.AES256);
      const combined = await (await aesEncryptAsync(utf8('reserva'), key)).combined('bytes');
      combined[combined.length - 1] = (combined[combined.length - 1] ?? 0) ^ 0xff;

      await expect(aesDecryptAsync(AESSealedData.fromCombined(combined), key)).rejects.toThrow();
    });

    it('rechaza el descifrado con datos asociados distintos', async () => {
      const key = await AESEncryptionKey.generate(AESKeySize.AES256);
      const sealed = await aesEncryptAsync(utf8('reserva'), key, { additionalData: utf8('ranura-a') });

      await expect(aesDecryptAsync(sealed, key, { additionalData: utf8('ranura-b') })).rejects.toThrow();
    });

    it('fromCombined rechaza cadenas, igual que el módulo nativo de Android (solo acepta bytes)', () => {
      expect(() => AESSealedData.fromCombined('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==')).toThrow(TypeError);
    });

    it('interpreta las cadenas como base64, igual que el módulo nativo', async () => {
      const key = await AESEncryptionKey.generate(AESKeySize.AES256);
      const sealed = await aesEncryptAsync('SG9sYQ==', key);

      expect(Buffer.from(await aesDecryptAsync(sealed, key)).toString('utf8')).toBe('Hola');
    });

    it('exporta e importa la llave en hexadecimal', async () => {
      const key = await AESEncryptionKey.generate(AESKeySize.AES256);
      const hex = await key.encoded('hex');

      const imported = await AESEncryptionKey.import(hex, 'hex');

      expect(hex).toMatch(/^[0-9a-f]{64}$/);
      expect(await imported.encoded('hex')).toBe(hex);
    });
  });

  describe('expo-secure-store (llavero en memoria)', () => {
    it('guarda, lee y registra las opciones de accesibilidad usadas', async () => {
      const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
      await SecureStore.setItemAsync('k', 'v', options);

      expect(await SecureStore.getItemAsync('k', options)).toBe('v');
      expect(secureStoreMock().calls[0]).toEqual({ method: 'set', key: 'k', options });
    });

    it('simula un almacén seguro no disponible', async () => {
      secureStoreMock().__setUnavailable(true);

      await expect(SecureStore.getItemAsync('k')).rejects.toThrow('SecureStore unavailable');
    });
  });

  describe('AsyncStorage (mock oficial)', () => {
    it('guarda y lee valores', async () => {
      await AsyncStorage.setItem('k', 'v');

      expect(await AsyncStorage.getItem('k')).toBe('v');
    });
  });
});
