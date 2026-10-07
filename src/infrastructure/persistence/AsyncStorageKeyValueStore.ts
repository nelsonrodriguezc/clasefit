import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KeyValueStore } from './KeyValueStore';

/** Plain AsyncStorage. Never used directly for personal data: it is wrapped by EncryptedKeyValueStore. */
export class AsyncStorageKeyValueStore implements KeyValueStore {
  getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  }

  removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  }
}
