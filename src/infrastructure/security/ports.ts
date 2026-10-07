import type { AESEncryptionKey } from 'expo-crypto';

/** Small secret storage (OS keychain/keystore). Only for secrets, never for bulk data. */
export interface SecretStore {
  get(name: string): Promise<string | null>;
  set(name: string, value: string): Promise<void>;
}

/** Provides the data-encryption key for the session. */
export interface EncryptionKeyProvider {
  getKey(): Promise<AESEncryptionKey>;
}

/** Authenticated encryption of text bound to associated data. */
export interface Cipher {
  /** Returns a base64 payload (nonce || ciphertext || tag). */
  seal(plaintext: string, associatedData: string): Promise<string>;
  /** Rejects with IntegrityError when the payload was altered or the associated data/key differ. */
  open(sealed: string, associatedData: string): Promise<string>;
}
