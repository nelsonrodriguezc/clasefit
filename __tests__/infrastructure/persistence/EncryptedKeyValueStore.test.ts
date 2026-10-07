import AsyncStorage from '@react-native-async-storage/async-storage';
import { AESEncryptionKey, AESKeySize } from 'expo-crypto';

import { AsyncStorageKeyValueStore } from '@/infrastructure/persistence/AsyncStorageKeyValueStore';
import { EncryptedKeyValueStore } from '@/infrastructure/persistence/EncryptedKeyValueStore';
import { ExpoAesGcmCipher } from '@/infrastructure/security/ExpoAesGcmCipher';
import { IntegrityError } from '@/infrastructure/security/IntegrityError';

describe('EncryptedKeyValueStore (decorador de cifrado sobre AsyncStorage)', () => {
  let store: EncryptedKeyValueStore;

  beforeEach(async () => {
    const key = await AESEncryptionKey.generate(AESKeySize.AES256);
    store = new EncryptedKeyValueStore(new AsyncStorageKeyValueStore(), new ExpoAesGcmCipher({ getKey: async () => key }));
  });

  it('guarda un sobre versionado {v, alg, data} y devuelve el valor original al leer', async () => {
    await store.setItem('slot', '{"secreto":"Laura"}');

    const raw = JSON.parse((await AsyncStorage.getItem('slot')) ?? '');
    expect(Object.keys(raw).sort()).toEqual(['alg', 'data', 'v']);
    expect(raw).toMatchObject({ v: 1, alg: 'A256GCM' });
    expect(raw.data).not.toContain('Laura');
    expect(await store.getItem('slot')).toBe('{"secreto":"Laura"}');
  });

  it('devuelve null si la clave no existe', async () => {
    expect(await store.getItem('missing')).toBeNull();
  });

  it('guardar dos veces el mismo valor produce contenidos cifrados distintos', async () => {
    await store.setItem('slot', 'igual');
    const first = await AsyncStorage.getItem('slot');
    await store.setItem('slot', 'igual');

    expect(await AsyncStorage.getItem('slot')).not.toBe(first);
  });

  it('rechaza con IntegrityError una versión de formato desconocida', async () => {
    await store.setItem('slot', 'valor');
    const raw = JSON.parse((await AsyncStorage.getItem('slot')) ?? '');
    await AsyncStorage.setItem('slot', JSON.stringify({ ...raw, v: 2 }));

    await expect(store.getItem('slot')).rejects.toBeInstanceOf(IntegrityError);
  });

  it('rechaza con IntegrityError un contenido que no es un sobre JSON', async () => {
    await AsyncStorage.setItem('slot', '[{"id":"B-1"}]');

    await expect(store.getItem('slot')).rejects.toBeInstanceOf(IntegrityError);
  });

  it('rechaza con IntegrityError un sobre copiado a otra clave (los datos asociados lo atan a su ranura)', async () => {
    await store.setItem('slot-a', 'valor');
    await AsyncStorage.setItem('slot-b', (await AsyncStorage.getItem('slot-a')) ?? '');

    await expect(store.getItem('slot-b')).rejects.toBeInstanceOf(IntegrityError);
  });

  it('elimina la clave del almacenamiento subyacente', async () => {
    await store.setItem('slot', 'valor');
    await store.removeItem('slot');

    expect(await AsyncStorage.getItem('slot')).toBeNull();
  });
});
