import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type * as SecureStoreDouble from '../../__mocks__/expo-secure-store';

/**
 * Access to the Jest doubles' helpers. The import must use the package name, exactly like the
 * production code, to get the same module instance. (jest.requireMock and importing the
 * __mocks__ file by path both create a separate instance with its own state.)
 */
export const secureStoreMock = () => SecureStore as unknown as typeof SecureStoreDouble;

export const asyncStorageMock = () =>
  AsyncStorage as unknown as typeof AsyncStorage & { __INTERNAL_MOCK_STORAGE__: Record<string, string> };
