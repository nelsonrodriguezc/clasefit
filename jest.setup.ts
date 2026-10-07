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

/**
 * A state update outside act() means a test stopped looking before the UI settled, so it fails the
 * test instead of only printing a warning that is easy to miss. One known third-party case is
 * ignored: after mounting or changing tabs, React Navigation's BottomTabView clears an internal
 * transition flag with a 32 ms timer that starts when the (mocked, asynchronous in Jest) native
 * animation reports its end. That update renders nothing the tests observe.
 */
const printError = console.error.bind(console);
const isActWarning = (message: unknown): message is string =>
  typeof message === 'string' && message.includes('not wrapped in act(');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((message?: unknown, ...rest: unknown[]) => {
    if (isActWarning(message)) {
      if (rest[0] === 'BottomTabView') return;
      throw new Error(`${expect.getState().currentTestName ?? 'unknown test'}: ${message.split('\n')[0]} (${String(rest[0])})`);
    }
    printError(message, ...rest);
  });
});
