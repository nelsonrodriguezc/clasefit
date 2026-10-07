/**
 * Acceptance suite for openspec spec `class-booking`.
 * One describe per Requirement and one it per Scenario, with the exact names of the spec.
 * Scenarios run through the use cases (same wiring as the app) and assert the member-facing
 * message through the presentation message catalog.
 */
import type { AppErrorCode } from '@/application/errors';
import type { UpcomingClass } from '@/application/views';
import { HOUR_MS, MINUTE_MS, parseLocalTime, sessionStart } from '@/domain/time/businessTime';
import { JsonClassCatalog } from '@/infrastructure/catalog/JsonClassCatalog';
import { ERROR_MESSAGES, TEXTS } from '@/presentation/messages';
import { spotsLabel } from '@/presentation/formatters';

import { aBooking, aGymClass, at, DAY_AFTER_TOMORROW, TODAY, TOMORROW, TUESDAY_10AM_BOGOTA } from '../support/builders';
import { InMemoryCatalog } from '../support/fakes';
import { createUseCases } from '../support/useCaseHarness';

type App = ReturnType<typeof createUseCases>;

const upcoming = async (app: App): Promise<readonly UpcomingClass[]> => {
  const result = await app.listUpcomingClasses.execute();
  if (!result.ok) throw new Error(`list failed: ${result.error}`);
  return result.value;
};
const find = async (app: App, sessionId: string) => (await upcoming(app)).find((item) => item.sessionId === sessionId);
const message = (code: AppErrorCode) => ERROR_MESSAGES[code];
const bookingStartingIn = (ms: number, id = 'B-1') => aBooking({ id, startsAt: TUESDAY_10AM_BOGOTA + ms });
const expectRejected = (result: { ok: boolean; error?: AppErrorCode }, text: string) => {
  expect(result.ok).toBe(false);
  expect(message(result.error as AppErrorCode)).toBe(text);
};

describe('Listado de próximas clases', () => {
  it('Clases de tres días ordenadas por fecha y hora', async () => {
    const app = createUseCases({ now: at('2026-10-06T05:00:00-05:00') });

    const items = await upcoming(app);

    expect(items.map((item) => item.daysFromToday)).toEqual([0, 0, 0, 0, 1, 1, 1, 1, 2, 2]);
    const starts = items.map((item) => item.startsAt);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  it('Clases que ya comenzaron no aparecen', async () => {
    const app = createUseCases({ now: at('2026-10-06T18:30:00-05:00') });

    const today = (await upcoming(app)).filter((item) => item.daysFromToday === 0).map((item) => item.classId);

    expect(today).toEqual(['C-03', 'C-04']);
  });

  it('Clase que comienza en este instante no aparece', async () => {
    const app = createUseCases({ now: at('2026-10-06T19:00:00-05:00') });

    expect((await upcoming(app)).map((item) => item.classId)).not.toContain('C-03');
  });

  it('Fecha calculada en hora de Bogotá aunque el dispositivo esté en otra zona', async () => {
    // The suite runs with TZ=Pacific/Kiritimati (UTC+14).
    const yoga = await find(createUseCases(), 'C-07@2026-10-07');

    expect(new Date(yoga?.startsAt ?? 0).toISOString()).toBe('2026-10-07T23:00:00.000Z');
  });

  it('Clases fuera de la ventana de tres días no aparecen', async () => {
    const app = createUseCases({ catalog: new InMemoryCatalog([aGymClass({ id: 'C-99', dayOffset: 3 })]) });

    expect(await upcoming(app)).toEqual([]);
  });
});

describe('Información de cada clase', () => {
  it('Cupos disponibles descuentan los ocupados por otros socios', async () => {
    const catalog = new InMemoryCatalog([aGymClass({ id: 'C-50', capacity: 20, takenByOthers: 15 })]);

    const [item] = await upcoming(createUseCases({ catalog }));

    expect(item).toMatchObject({ name: 'Yoga', instructor: 'Valentina Ríos', daysFromToday: 1 });
    expect(spotsLabel(item?.availableSpots ?? -1, item?.capacity ?? -1)).toBe('5 de 20 cupos');
  });

  it('Cupos disponibles incluyen la reserva de la socia', async () => {
    const app = createUseCases({ bookings: [aBooking({ classId: 'C-02', sessionDate: TODAY })] });

    const funcional = await find(app, 'C-02@2026-10-06');

    expect(spotsLabel(funcional?.availableSpots ?? -1, funcional?.capacity ?? -1)).toBe('5 de 15 cupos');
  });
});

describe('Clase llena', () => {
  it('Clase sin cupos se muestra como Llena', async () => {
    const yogaHoy = await find(createUseCases(), 'C-03@2026-10-06');

    expect(yogaHoy).toMatchObject({ capacity: 12, availableSpots: 0, isFull: true });
    expect(TEXTS.full).toBe('Llena');
  });
});

describe('Reservar una clase', () => {
  it('Reserva exitosa', async () => {
    const app = createUseCases();
    expect((await find(app, 'C-07@2026-10-07'))?.availableSpots).toBe(7);

    const result = await app.bookClass.execute('C-07@2026-10-07');

    expect(result.ok).toBe(true);
    expect(TEXTS.bookingConfirmed).toBe('¡Listo! Tu cupo está reservado');
    expect((await find(app, 'C-07@2026-10-07'))?.availableSpots).toBe(6);
    const mine = await app.listMyBookings.execute();
    expect(mine.ok && mine.value.map((booking) => booking.sessionId)).toEqual(['C-07@2026-10-07']);
  });

  it('Reserva de una clase que ya comenzó', async () => {
    const app = createUseCases({ now: at('2026-10-06T17:59:00-05:00') });
    expect(await find(app, 'C-02@2026-10-06')).toBeDefined();
    app.clock.set(at('2026-10-06T18:00:00-05:00'));

    expectRejected(await app.bookClass.execute('C-02@2026-10-06'), 'Esta clase ya no está disponible.');
  });
});

describe('RN-01 · No reservar clases sin cupos', () => {
  it('Reserva rechazada por clase llena', async () => {
    const app = createUseCases();

    expectRejected(await app.bookClass.execute('C-08@2026-10-07'), 'Esta clase ya no tiene cupos.');
    expect((await find(app, 'C-08@2026-10-07'))?.availableSpots).toBe(0);
  });

  it('Reserva del último cupo disponible', async () => {
    const app = createUseCases();

    expect((await app.bookClass.execute('C-06@2026-10-07')).ok).toBe(true);
    expect((await find(app, 'C-06@2026-10-07'))?.isFull).toBe(true);
  });
});

describe('RN-02 · No reservar la misma clase dos veces', () => {
  it('Segunda reserva de la misma clase', async () => {
    const app = createUseCases();
    await app.bookClass.execute('C-07@2026-10-07');

    expectRejected(await app.bookClass.execute('C-07@2026-10-07'), 'Ya reservaste esta clase.');
  });

  it('Doble toque simultáneo en reservar', async () => {
    const app = createUseCases();

    const results = await Promise.all([app.bookClass.execute('C-07@2026-10-07'), app.bookClass.execute('C-07@2026-10-07')]);

    expect(results.filter((result) => result.ok)).toHaveLength(1);
    const rejected = results.find((result) => !result.ok);
    expectRejected(rejected as { ok: boolean; error?: AppErrorCode }, 'Ya reservaste esta clase.');
  });
});

describe('RN-03 · Máximo 2 reservas por día de clase', () => {
  it('Tercera reserva del mismo día', async () => {
    const app = createUseCases();
    await app.bookClass.execute('C-05@2026-10-07');
    await app.bookClass.execute('C-06@2026-10-07');

    expectRejected(await app.bookClass.execute('C-07@2026-10-07'), 'Solo puedes reservar 2 clases por día.');
  });

  it('Reservas en días distintos', async () => {
    const app = createUseCases();
    await app.bookClass.execute('C-02@2026-10-06');
    await app.bookClass.execute('C-04@2026-10-06');

    expect((await app.bookClass.execute('C-05@2026-10-07')).ok).toBe(true);
  });

  it('Solicitudes simultáneas que superarían el límite', async () => {
    const app = createUseCases({ bookings: [aBooking({ id: 'B-0', classId: 'C-05', sessionDate: TOMORROW })] });

    const results = await Promise.all([app.bookClass.execute('C-06@2026-10-07'), app.bookClass.execute('C-07@2026-10-07')]);

    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expectRejected(results.find((result) => !result.ok) as { ok: boolean; error?: AppErrorCode }, 'Solo puedes reservar 2 clases por día.');
  });

  it('El límite cuenta clases del día que ya comenzaron', async () => {
    const app = createUseCases({
      bookings: [
        aBooking({ id: 'B-0', classId: 'C-01', sessionDate: TODAY, startsAt: sessionStart(TODAY, parseLocalTime('06:00')) }),
        aBooking({ id: 'B-1', classId: 'C-02', sessionDate: TODAY, startsAt: sessionStart(TODAY, parseLocalTime('18:00')) }),
      ],
    });

    expectRejected(await app.bookClass.execute('C-04@2026-10-06'), 'Solo puedes reservar 2 clases por día.');
  });

  it('Cancelar libera el límite diario', async () => {
    const app = createUseCases();
    const first = await app.bookClass.execute('C-05@2026-10-07');
    await app.bookClass.execute('C-06@2026-10-07');

    expect((await app.cancelBooking.execute(first.ok ? first.value.id : '')).ok).toBe(true);
    expect((await app.bookClass.execute('C-07@2026-10-07')).ok).toBe(true);
  });
});

describe('Ver mis reservas', () => {
  it('Reservas ordenadas por proximidad', async () => {
    const app = createUseCases({
      bookings: [
        aBooking({ id: 'B-yoga', classId: 'C-10', sessionDate: DAY_AFTER_TOMORROW, startsAt: sessionStart(DAY_AFTER_TOMORROW, parseLocalTime('09:00')) }),
        aBooking({ id: 'B-spin', classId: 'C-05', sessionDate: TOMORROW, startsAt: sessionStart(TOMORROW, parseLocalTime('06:00')) }),
      ],
    });

    const mine = await app.listMyBookings.execute();

    expect(mine.ok && mine.value.map((booking) => booking.id)).toEqual(['B-spin', 'B-yoga']);
  });

  it('Reservas de clases ya comenzadas no aparecen', async () => {
    const app = createUseCases({
      now: at('2026-10-06T07:00:00-05:00'),
      bookings: [aBooking({ classId: 'C-01', sessionDate: TODAY, startsAt: sessionStart(TODAY, parseLocalTime('06:00')) })],
    });

    expect(await app.listMyBookings.execute()).toEqual({ ok: true, value: [] });
  });

  it('Sin reservas', async () => {
    expect(await createUseCases().listMyBookings.execute()).toEqual({ ok: true, value: [] });
    expect(TEXTS.noBookings).toBe('Aún no tienes reservas');
  });
});

describe('Cancelar una reserva con confirmación', () => {
  it('Cancelación confirmada', async () => {
    const app = createUseCases();
    const booked = await app.bookClass.execute('C-07@2026-10-07');
    const id = booked.ok ? booked.value.id : '';

    expect((await app.cancelBooking.check(id)).ok).toBe(true); // the UI asks for confirmation
    expect((await app.cancelBooking.execute(id)).ok).toBe(true); // confirmed

    expect(await app.listMyBookings.execute()).toEqual({ ok: true, value: [] });
    expect((await find(app, 'C-07@2026-10-07'))?.availableSpots).toBe(7);
    expect(TEXTS.bookingCancelled).toBe('Reserva cancelada. Liberamos tu cupo.');
  });

  it('Cancelación desistida', async () => {
    const app = createUseCases({ bookings: [bookingStartingIn(5 * HOUR_MS)] });

    await app.cancelBooking.check('B-1'); // confirmation shown, the member does not confirm

    const mine = await app.listMyBookings.execute();
    expect(mine.ok && mine.value).toHaveLength(1);
  });
});

describe('RN-04 · Cancelar solo hasta 2 horas antes', () => {
  it('Cancelación con más de 2 horas de anticipación', async () => {
    const app = createUseCases({ bookings: [bookingStartingIn(3 * HOUR_MS)] });

    expect((await app.cancelBooking.execute('B-1')).ok).toBe(true);
  });

  it('Cancelación exactamente 2 horas antes', async () => {
    const app = createUseCases({ bookings: [bookingStartingIn(2 * HOUR_MS)] });

    expect((await app.cancelBooking.execute('B-1')).ok).toBe(true);
  });

  it('Cancelación con menos de 2 horas', async () => {
    const app = createUseCases({ bookings: [bookingStartingIn(HOUR_MS + 59 * MINUTE_MS)] });

    expectRejected(await app.cancelBooking.check('B-1'), 'Ya no puedes cancelar: faltan menos de 2 horas.');
    const mine = await app.listMyBookings.execute();
    expect(mine.ok && mine.value).toHaveLength(1);
  });

  it('El plazo vence mientras se confirma', async () => {
    const app = createUseCases({ bookings: [bookingStartingIn(2 * HOUR_MS + MINUTE_MS)] });
    expect((await app.cancelBooking.check('B-1')).ok).toBe(true);
    app.clock.advance(2 * MINUTE_MS);

    expectRejected(await app.cancelBooking.execute('B-1'), 'Ya no puedes cancelar: faltan menos de 2 horas.');
    const mine = await app.listMyBookings.execute();
    expect(mine.ok && mine.value).toHaveLength(1);
  });
});

describe('Prioridad de mensajes cuando fallan varias reglas', () => {
  it('Clase ya reservada y sin cupos', async () => {
    const app = createUseCases();
    await app.bookClass.execute('C-06@2026-10-07'); // last spot

    expectRejected(await app.bookClass.execute('C-06@2026-10-07'), 'Ya reservaste esta clase.');
  });

  it('Clase sin cupos con el límite diario alcanzado', async () => {
    const app = createUseCases();
    await app.bookClass.execute('C-05@2026-10-07');
    await app.bookClass.execute('C-07@2026-10-07');

    expectRejected(await app.bookClass.execute('C-08@2026-10-07'), 'Esta clase ya no tiene cupos.');
  });
});

describe('Catálogo de clases válido', () => {
  it('Catálogo del insumo aceptado', async () => {
    const app = createUseCases({ now: at('2026-10-06T05:00:00-05:00') });

    expect(await upcoming(app)).toHaveLength(10);
  });

  it('Catálogo con estructura inválida', async () => {
    const app = createUseCases({ catalog: new JsonClassCatalog({ gimnasio: 'ClaseFit', clases: [{ id: 'C-01', nombre: 'Yoga', hora: '7pm' }] }) });

    const result = await app.listUpcomingClasses.execute();

    expect(result.ok).toBe(false);
    expect(message(result.ok ? 'UNEXPECTED' : result.error)).toBe('No pudimos cargar las clases.');
  });

  it('Catálogo con más ocupados que cupos', async () => {
    const invalid = {
      gimnasio: 'ClaseFit',
      clases: [{ id: 'C-01', nombre: 'Yoga', instructor: 'Valentina Ríos', diaOffset: 1, hora: '18:00', duracionMin: 60, cupoTotal: 12, ocupados: 13 }],
    };
    const app = createUseCases({ catalog: new JsonClassCatalog(invalid) });

    const result = await app.listUpcomingClasses.execute();

    expect(message(result.ok ? 'UNEXPECTED' : result.error)).toBe('No pudimos cargar las clases.');
  });
});
