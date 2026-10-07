/**
 * Jest double of expo-secure-store (used automatically for the node_modules package):
 * an in-memory keychain that records the options of every call and can simulate an
 * unavailable secure store. Reset before every test in jest.setup.ts.
 */
type Options = { keychainAccessible?: number; keychainService?: string; requireAuthentication?: boolean };

export const AFTER_FIRST_UNLOCK = 0;
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 1;
export const ALWAYS = 2;
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 3;
export const ALWAYS_THIS_DEVICE_ONLY = 4;
export const WHEN_UNLOCKED = 5;
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 6;

const store = new Map<string, string>();
export const calls: { method: 'get' | 'set' | 'delete'; key: string; options?: Options }[] = [];
let unavailable = false;

const slot = (key: string, options?: Options) => `${options?.keychainService ?? 'default'}:${key}`;
const guard = () => {
  if (unavailable) throw new Error('SecureStore unavailable');
};

export const __reset = (): void => {
  store.clear();
  calls.length = 0;
  unavailable = false;
};
export const __setUnavailable = (value: boolean): void => {
  unavailable = value;
};
/** Raw keychain content, for assertions. */
export const __entries = (): [string, string][] => [...store.entries()];

export const isAvailableAsync = async (): Promise<boolean> => !unavailable;

export const getItemAsync = async (key: string, options?: Options): Promise<string | null> => {
  guard();
  calls.push({ method: 'get', key, options });
  return store.get(slot(key, options)) ?? null;
};

export const setItemAsync = async (key: string, value: string, options?: Options): Promise<void> => {
  guard();
  calls.push({ method: 'set', key, options });
  store.set(slot(key, options), value);
};

export const deleteItemAsync = async (key: string, options?: Options): Promise<void> => {
  guard();
  calls.push({ method: 'delete', key, options });
  store.delete(slot(key, options));
};
