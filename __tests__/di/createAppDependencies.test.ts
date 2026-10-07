import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAppDependencies } from '@/di/createAppDependencies';

import { at } from '../support/builders';
import { FixedClock, RecordingLogger } from '../support/fakes';

describe('Composition root (createAppDependencies)', () => {
  const compose = () =>
    createAppDependencies({ clock: new FixedClock(at('2026-10-06T05:00:00-05:00')), logger: new RecordingLogger() });

  it('conecta los casos de uso con el catálogo empaquetado del insumo', async () => {
    const result = await compose().listUpcomingClasses.execute();

    expect(result.ok && result.value).toHaveLength(10);
  });

  it('persiste las reservas cifradas (nunca en claro) usando el repositorio seguro', async () => {
    const app = compose();

    const booking = await app.bookClass.execute('C-07@2026-10-07');

    expect(booking.ok).toBe(true);
    const stored = (await AsyncStorage.multiGet(await AsyncStorage.getAllKeys())).map(([, value]) => value).join();
    expect(stored).toContain('"alg":"A256GCM"');
    expect(stored).not.toContain('Yoga');
  });

  it('las reservas sobreviven a una nueva composición (reabrir la app)', async () => {
    await compose().bookClass.execute('C-07@2026-10-07');

    const myBookings = await compose().listMyBookings.execute();

    expect(myBookings.ok && myBookings.value.map((booking) => booking.sessionId)).toEqual(['C-07@2026-10-07']);
  });

  it('genera identificadores de reserva no secuenciales (UUID)', async () => {
    const result = await compose().bookClass.execute('C-07@2026-10-07');

    expect(result.ok && result.value.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
