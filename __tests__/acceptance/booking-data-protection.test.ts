/**
 * Acceptance suite for openspec spec `booking-data-protection`.
 * One describe per Requirement and one it per Scenario, with the exact names of the spec.
 * It runs the real adapters (AsyncStorage + AES-GCM + SecureStore) over the Jest doubles.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ConsoleLogger } from '@/infrastructure/logging/ConsoleLogger';
import { BOOKINGS_STORAGE_KEY } from '@/infrastructure/persistence/PersistentBookingRepository';
import { DEK_NAME } from '@/infrastructure/security/SecureStoreKeyProvider';
import { parseBusinessDate, parseLocalTime, sessionStart } from '@/domain/time/businessTime';

import { aBooking, LAURA, TOMORROW } from '../support/builders';
import { secureStoreMock } from '../support/mocks';
import { createSecureStack } from '../support/secureStack';
import { createUseCases } from '../support/useCaseHarness';

const YOGA_TOMORROW = 'C-07@2026-10-07';
const rawStorage = () => AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
const storedEnvelope = async () => JSON.parse((await rawStorage()) ?? 'null') as { v: number; alg: string; data: string };

const bookThroughApp = async () => {
  const stack = createSecureStack();
  const app = createUseCases({ repository: stack.repository });
  const result = await app.bookClass.execute(YOGA_TOMORROW);
  if (!result.ok) throw new Error(`booking failed: ${result.error}`);
  return { stack, app };
};

describe('Persistencia cifrada de reservas', () => {
  it('Reabrir la app conserva las reservas', async () => {
    await bookThroughApp();

    const reopened = createUseCases({ repository: createSecureStack().repository });
    const myBookings = await reopened.listMyBookings.execute();

    expect(myBookings.ok && myBookings.value.map((booking) => booking.sessionId)).toEqual([YOGA_TOMORROW]);
  });

  it('Almacenamiento local sin datos legibles', async () => {
    await bookThroughApp();

    const everything = JSON.stringify(await AsyncStorage.multiGet(await AsyncStorage.getAllKeys()));
    for (const plaintext of ['Yoga', 'Valentina', 'C-07', 'S-0001', 'Laura', '2026-10-07']) {
      expect(everything).not.toContain(plaintext);
    }
    expect(await storedEnvelope()).toMatchObject({ v: 1, alg: 'A256GCM' });
  });

  it('Mismo contenido guardado dos veces produce cifrados distintos', async () => {
    const { store } = createSecureStack();
    await store.setItem(BOOKINGS_STORAGE_KEY, '[]');
    const first = await rawStorage();
    await store.setItem(BOOKINGS_STORAGE_KEY, '[]');

    expect(await rawStorage()).not.toBe(first);
  });
});

describe('Custodia de la llave de cifrado', () => {
  it('Primera ejecución genera la llave', async () => {
    expect(secureStoreMock().__entries()).toEqual([]);

    await bookThroughApp();

    const [entry] = secureStoreMock().__entries();
    expect(entry?.[0]).toBe(`clasefit:${DEK_NAME}`);
    expect(entry?.[1]).toMatch(/^[0-9a-f]{64}$/); // 256 bits
    const writes = secureStoreMock().calls.filter((call) => call.method === 'set');
    expect(writes).toHaveLength(1);
    expect(writes[0]?.options?.keychainAccessible).toBe(secureStoreMock().WHEN_UNLOCKED_THIS_DEVICE_ONLY);
  });

  it('Ejecuciones siguientes reutilizan la llave', async () => {
    await bookThroughApp();
    const keyAfterFirstRun = secureStoreMock().__entries();

    const reopened = createUseCases({ repository: createSecureStack().repository });
    await reopened.listMyBookings.execute();
    await reopened.cancelBooking.execute('B-1');

    expect(secureStoreMock().__entries()).toEqual(keyAfterFirstRun);
    expect(secureStoreMock().calls.filter((call) => call.method === 'set')).toHaveLength(1);
  });

  it('Copias de seguridad automáticas excluidas', () => {
    const appJson = JSON.parse(readFileSync(join(__dirname, '..', '..', 'app.json'), 'utf8'));

    expect(appJson.expo.android.allowBackup).toBe(false);
  });
});

describe('Integridad y falla segura al leer', () => {
  const expectDiscarded = async () => {
    const reopened = createUseCases({ repository: createSecureStack().repository });
    expect(await reopened.listMyBookings.execute()).toEqual({ ok: true, value: [] });
    expect(await rawStorage()).toBeNull();
  };

  it('Datos cifrados alterados', async () => {
    await bookThroughApp();
    const envelope = await storedEnvelope();
    const bytes = Buffer.from(envelope.data, 'base64');
    bytes[20] = (bytes[20] ?? 0) ^ 0x01;
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify({ ...envelope, data: bytes.toString('base64') }));

    await expectDiscarded();
  });

  it('Llave ausente con datos guardados', async () => {
    await bookThroughApp();
    secureStoreMock().__reset();

    await expectDiscarded();
  });

  it('Formato de almacenamiento desconocido', async () => {
    await bookThroughApp();
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify({ ...(await storedEnvelope()), v: 99 }));

    await expectDiscarded();
  });

  it('Contenido descifrado con estructura inválida', async () => {
    const { store } = createSecureStack();
    await store.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify({ hacked: true }));

    await expectDiscarded();
  });
});

describe('Falla segura al guardar', () => {
  it('Error al guardar una reserva', async () => {
    secureStoreMock().__setUnavailable(true);
    const app = createUseCases({ repository: createSecureStack().repository });

    expect(await app.bookClass.execute(YOGA_TOMORROW)).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
    expect(await app.listMyBookings.execute()).toEqual({ ok: true, value: [] });
  });

  it('Error al guardar una cancelación', async () => {
    const { app } = await bookThroughApp();
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));

    expect(await app.cancelBooking.execute('B-1')).toEqual({ ok: false, error: 'UNEXPECTED' });
    const myBookings = await app.listMyBookings.execute();
    expect(myBookings.ok && myBookings.value).toHaveLength(1);
  });
});

describe('Minimización y retención de datos', () => {
  it('Reserva guardada sin el nombre de la socia', async () => {
    const { stack } = await bookThroughApp();

    const decrypted = await stack.store.getItem(BOOKINGS_STORAGE_KEY);

    expect(decrypted).toContain(LAURA.id);
    expect(decrypted).not.toContain(LAURA.name);
    expect(decrypted).not.toContain('Laura');
  });

  it('Reservas de días anteriores se eliminan', async () => {
    const yesterday = parseBusinessDate('2026-10-05');
    const seed = createSecureStack().repository;
    await seed.add(aBooking({ id: 'B-yesterday', sessionDate: yesterday, startsAt: sessionStart(yesterday, parseLocalTime('18:00')) }));
    await seed.add(aBooking({ id: 'B-tomorrow', sessionDate: TOMORROW }));

    const reopened = createSecureStack();
    const app = createUseCases({ repository: reopened.repository });
    await app.purgeExpiredBookings.execute();

    const stored = JSON.parse((await createSecureStack().store.getItem(BOOKINGS_STORAGE_KEY)) ?? '[]') as { id: string }[];
    expect(stored.map((booking) => booking.id)).toEqual(['B-tomorrow']);
  });
});

describe('Registros sin datos personales', () => {
  it('Error de integridad registrado sin datos personales', async () => {
    await bookThroughApp();
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify({ ...(await storedEnvelope()), data: 'AAAA' }));
    const stack = createSecureStack();

    await stack.repository.findByMember(LAURA.id);

    expect(stack.logger.events()).toEqual(['storage.integrity_failure']);
    const logged = JSON.stringify(stack.logger.entries);
    for (const personal of ['Laura', 'S-0001', 'Yoga', 'Valentina', '2026-10-07', 'C-07']) {
      expect(logged).not.toContain(personal);
    }
  });

  it('Registros silenciados en producción', async () => {
    const sink = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const productionLogger = new ConsoleLogger(false, sink);
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, 'corrupto');

    await createSecureStack(productionLogger).repository.findByMember(LAURA.id);

    expect(sink.info).not.toHaveBeenCalled();
    expect(sink.warn).not.toHaveBeenCalled();
    expect(sink.error).not.toHaveBeenCalled();
  });
});
