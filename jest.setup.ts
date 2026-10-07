import AsyncStorage from '@react-native-async-storage/async-storage';

import { secureStoreMock } from './__tests__/support/mocks';

// Official Jest mock: provides safe-area metrics so navigation renders in tests.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual<{ default: unknown }>('react-native-safe-area-context/jest/mock').default,
);

// Every test starts with an empty keychain and an empty AsyncStorage.
beforeEach(async () => {
  secureStoreMock().__reset();
  await AsyncStorage.clear();
});
