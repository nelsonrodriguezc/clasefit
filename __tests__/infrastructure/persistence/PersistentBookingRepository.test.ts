import AsyncStorage from '@react-native-async-storage/async-storage';

import { BOOKINGS_STORAGE_KEY } from '@/infrastructure/persistence/PersistentBookingRepository';

import { aBooking } from '../../support/builders';
import { secureStoreMock } from '../../support/mocks';
import { createSecureStack } from '../../support/secureStack';

describe('PersistentBookingRepository', () => {
  it('es write-through: si no se puede guardar, add falla y la reserva no queda en memoria', async () => {
    const { repository } = createSecureStack();
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));

    await expect(repository.add(aBooking({ id: 'B-1' }))).rejects.toThrow('disk full');
    expect(await repository.findByMember('S-0001')).toEqual([]);

    await repository.add(aBooking({ id: 'B-2' }));
    expect((await repository.findByMember('S-0001')).map((booking) => booking.id)).toEqual(['B-2']);
  });

  it('si no se puede guardar una eliminación, la reserva se conserva', async () => {
    const { repository } = createSecureStack();
    await repository.add(aBooking({ id: 'B-1' }));
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));

    await expect(repository.remove(['B-1'])).rejects.toThrow('disk full');
    expect(await repository.findByMember('S-0001')).toHaveLength(1);
  });

  it('lee el almacenamiento una sola vez aunque lleguen consultas simultáneas', async () => {
    const { repository } = createSecureStack();
    const getItem = jest.spyOn(AsyncStorage, 'getItem');

    await Promise.all([repository.findByMember('S-0001'), repository.findByMember('S-0001')]);
    await repository.findByMember('S-0001');

    expect(getItem).toHaveBeenCalledTimes(1);
  });

  it('descarta un contenido descifrado que no es JSON', async () => {
    const stack = createSecureStack();
    await stack.store.setItem(BOOKINGS_STORAGE_KEY, 'esto no es JSON');

    expect(await createSecureStack().repository.findByMember('S-0001')).toEqual([]);
    expect(await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY)).toBeNull();
  });

  it('descarta reservas guardadas con una fecha imposible', async () => {
    const stack = createSecureStack();
    const tampered = { ...aBooking({ id: 'B-1' }), sessionDate: '2026-02-30' };
    await stack.store.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([tampered]));

    expect(await createSecureStack().repository.findByMember('S-0001')).toEqual([]);
  });

  it('descarta reservas guardadas con campos desconocidos (por ejemplo, datos personales agregados)', async () => {
    const stack = createSecureStack();
    const tampered = { ...aBooking({ id: 'B-1' }), memberName: 'Laura Gómez' };
    await stack.store.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([tampered]));

    expect(await createSecureStack().repository.findByMember('S-0001')).toEqual([]);
  });

  it('una falla del almacén seguro al leer se propaga y no borra los datos (puede ser transitoria)', async () => {
    await createSecureStack().repository.add(aBooking({ id: 'B-1' }));
    secureStoreMock().__setUnavailable(true);

    await expect(createSecureStack().repository.findByMember('S-0001')).rejects.toThrow('SecureStore unavailable');
    expect(await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY)).not.toBeNull();
  });
});
