import type { Logger } from '@/application/ports/Logger';
import { AsyncStorageKeyValueStore } from '@/infrastructure/persistence/AsyncStorageKeyValueStore';
import { EncryptedKeyValueStore } from '@/infrastructure/persistence/EncryptedKeyValueStore';
import { PersistentBookingRepository } from '@/infrastructure/persistence/PersistentBookingRepository';
import { ExpoAesGcmCipher } from '@/infrastructure/security/ExpoAesGcmCipher';
import { ExpoSecretStore } from '@/infrastructure/security/ExpoSecretStore';
import { SecureStoreKeyProvider } from '@/infrastructure/security/SecureStoreKeyProvider';

import { RecordingLogger } from './fakes';

/**
 * Builds the same secure persistence stack as src/di (real adapters over the Jest doubles of
 * AsyncStorage, SecureStore and expo-crypto). Calling it again simulates reopening the app:
 * new objects, same device storage.
 */
export function createSecureStack<TLogger extends Logger = RecordingLogger>(logger?: TLogger) {
  const log = (logger ?? new RecordingLogger()) as TLogger;
  const keyProvider = new SecureStoreKeyProvider(new ExpoSecretStore(), log);
  const cipher = new ExpoAesGcmCipher(keyProvider);
  const store = new EncryptedKeyValueStore(new AsyncStorageKeyValueStore(), cipher);
  return { repository: new PersistentBookingRepository(store, log), store, cipher, logger: log };
}
