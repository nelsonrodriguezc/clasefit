import * as SecureStore from 'expo-secure-store';

import { ExpoSecretStore } from '@/infrastructure/security/ExpoSecretStore';
import { DEK_NAME, SecureStoreKeyProvider } from '@/infrastructure/security/SecureStoreKeyProvider';

import { RecordingLogger } from '../../support/fakes';
import { secureStoreMock } from '../../support/mocks';

const KNOWN_KEY = 'a'.repeat(64);

const createProvider = () => {
  const logger = new RecordingLogger();
  return { provider: new SecureStoreKeyProvider(new ExpoSecretStore(), logger), logger };
};

describe('ExpoSecretStore', () => {
  it('usa un servicio propio y accesibilidad WHEN_UNLOCKED_THIS_DEVICE_ONLY en cada operación', async () => {
    const store = new ExpoSecretStore();
    await store.set('k', 'v');
    await store.get('k');

    for (const call of secureStoreMock().calls) {
      expect(call.options).toEqual({
        keychainService: 'clasefit',
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }
    expect(secureStoreMock().calls).toHaveLength(2);
  });
});

describe('SecureStoreKeyProvider', () => {
  it('genera una llave de 256 bits en el primer uso y la guarda solo en el almacén seguro', async () => {
    const { provider, logger } = createProvider();

    const key = await provider.getKey();

    expect(key.size).toBe(256);
    const entries = secureStoreMock().__entries();
    expect(entries).toEqual([[`clasefit:${DEK_NAME}`, await key.encoded('hex')]]);
    expect(entries[0]?.[1]).toMatch(/^[0-9a-f]{64}$/);
    expect(logger.events()).toEqual(['storage.key_created']);
  });

  it('reutiliza la llave existente sin generar otra', async () => {
    await new ExpoSecretStore().set(DEK_NAME, KNOWN_KEY);
    const { provider } = createProvider();

    expect(await (await provider.getKey()).encoded('hex')).toBe(KNOWN_KEY);
    expect(secureStoreMock().calls.filter((call) => call.method === 'set')).toHaveLength(1);
  });

  it('mantiene la llave en memoria durante la sesión (una sola lectura)', async () => {
    const { provider } = createProvider();

    await Promise.all([provider.getKey(), provider.getKey()]);
    await provider.getKey();

    expect(secureStoreMock().calls.filter((call) => call.method === 'get')).toHaveLength(1);
  });

  it('reemplaza una llave guardada corrupta y lo registra como falla de integridad', async () => {
    await new ExpoSecretStore().set(DEK_NAME, 'not-a-key');
    const { provider, logger } = createProvider();

    const key = await provider.getKey();

    expect(await key.encoded('hex')).not.toBe('not-a-key');
    expect(logger.events()).toEqual(['storage.integrity_failure', 'storage.key_created']);
  });

  it('si el almacén seguro no está disponible falla sin generar llave y permite reintentar', async () => {
    secureStoreMock().__setUnavailable(true);
    const { provider } = createProvider();

    await expect(provider.getKey()).rejects.toThrow('SecureStore unavailable');

    secureStoreMock().__setUnavailable(false);
    await expect(provider.getKey()).resolves.toBeDefined();
  });
});
