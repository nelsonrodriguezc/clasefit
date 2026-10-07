import * as SecureStore from 'expo-secure-store';

import type { SecretStore } from './ports';

/**
 * SecretStore over expo-secure-store (iOS Keychain / Android Keystore-backed storage).
 * WHEN_UNLOCKED_THIS_DEVICE_ONLY: readable only while the device is unlocked and never migrated
 * to another device through backups.
 */
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'clasefit',
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export class ExpoSecretStore implements SecretStore {
  get(name: string): Promise<string | null> {
    return SecureStore.getItemAsync(name, OPTIONS);
  }

  set(name: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(name, value, OPTIONS);
  }
}
