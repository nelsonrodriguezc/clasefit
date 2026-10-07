import { AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';

import { base64ToBytes, bytesToBase64 } from './base64';
import { IntegrityError } from './IntegrityError';
import type { Cipher, EncryptionKeyProvider } from './ports';
import { utf8Decode, utf8Encode } from './utf8';

const NONCE_BYTES = 12; // 96-bit random nonce per encryption, as recommended for AES-GCM (NIST SP 800-38D)

/**
 * AES-256-GCM with the platform implementation exposed by expo-crypto (CryptoKit / javax.crypto).
 * Only bytes cross the native boundary: on Android, AESSealedData.fromCombined rejects strings.
 */
export class ExpoAesGcmCipher implements Cipher {
  constructor(private readonly keys: EncryptionKeyProvider) {}

  async seal(plaintext: string, associatedData: string): Promise<string> {
    const key = await this.keys.getKey();
    const sealed = await aesEncryptAsync(utf8Encode(plaintext), key, {
      nonce: { length: NONCE_BYTES },
      additionalData: utf8Encode(associatedData),
    });
    return bytesToBase64(await sealed.combined('bytes'));
  }

  async open(sealed: string, associatedData: string): Promise<string> {
    const key = await this.keys.getKey(); // key failures propagate: they are not evidence of tampering
    try {
      const data = AESSealedData.fromCombined(base64ToBytes(sealed));
      const bytes = await aesDecryptAsync(data, key, { additionalData: utf8Encode(associatedData) });
      return utf8Decode(bytes);
    } catch {
      throw new IntegrityError('decrypt_failed');
    }
  }
}
