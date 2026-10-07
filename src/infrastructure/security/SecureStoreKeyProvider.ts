import { AESEncryptionKey, AESKeySize } from 'expo-crypto';

import type { Logger } from '@/application/ports/Logger';

import type { EncryptionKeyProvider, SecretStore } from './ports';

/** Name of the data-encryption key (DEK) inside the secure store. */
export const DEK_NAME = 'clasefit.dek.v1';

/**
 * Gets the 256-bit DEK from the secure store or creates it on first use. The key never leaves the
 * device and is kept in memory only for the current session. A stored key that cannot be imported
 * is replaced (the data it protected is unreadable anyway and will be discarded).
 */
export class SecureStoreKeyProvider implements EncryptionKeyProvider {
  private pending?: Promise<AESEncryptionKey>;

  constructor(
    private readonly secrets: SecretStore,
    private readonly logger: Logger,
  ) {}

  getKey(): Promise<AESEncryptionKey> {
    if (!this.pending) {
      this.pending = this.loadOrCreate().catch((error: unknown) => {
        this.pending = undefined; // do not cache failures: the secure store may be temporarily unavailable
        throw error;
      });
    }
    return this.pending;
  }

  private async loadOrCreate(): Promise<AESEncryptionKey> {
    const stored = await this.secrets.get(DEK_NAME);
    if (stored) {
      try {
        return await AESEncryptionKey.import(stored, 'hex');
      } catch {
        this.logger.warn('storage.integrity_failure', { reason: 'invalid_key' });
      }
    }
    const key = await AESEncryptionKey.generate(AESKeySize.AES256);
    await this.secrets.set(DEK_NAME, await key.encoded('hex'));
    this.logger.info('storage.key_created');
    return key;
  }
}
