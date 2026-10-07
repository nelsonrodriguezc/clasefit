import type { TaskQueue } from '@/application/ports/TaskQueue';
import { err } from '@/domain/shared/Result';

import { aBooking, at, TOMORROW } from '../support/builders';
import { FakeBookingRepository } from '../support/fakes';
import { createUseCases } from '../support/useCaseHarness';

const YOGA_TOMORROW = 'C-07@2026-10-07';

/** A queue that does not serialize anything: used to prove the real queue is what prevents races. */
const passThroughQueue: TaskQueue = { run: (task) => task() };

describe('BookClass', () => {
  it('Scenario: Reserva exitosa', async () => {
    const { bookClass, listUpcomingClasses, repository } = createUseCases();

    const result = await bookClass.execute(YOGA_TOMORROW);

    expect(result.ok).toBe(true);
    expect((repository as FakeBookingRepository).all()).toHaveLength(1);
    const listed = await listUpcomingClasses.execute();
    const yoga = listed.ok ? listed.value.find((item) => item.sessionId === YOGA_TOMORROW) : undefined;
    expect(yoga).toMatchObject({ availableSpots: 6, isBookedByMember: true });
  });

  it('Scenario: Reserva de una clase que ya comenzó', async () => {
    const harness = createUseCases({ now: at('2026-10-06T17:59:00-05:00') });
    harness.clock.set(at('2026-10-06T18:00:00-05:00'));

    expect(await harness.bookClass.execute('C-02@2026-10-06')).toEqual({ ok: false, error: 'SESSION_ALREADY_STARTED' });
  });

  it('rechaza una sesión que no existe en la ventana actual', async () => {
    const { bookClass } = createUseCases();

    expect(await bookClass.execute('C-07@2026-10-20')).toEqual({ ok: false, error: 'SESSION_NOT_FOUND' });
  });

  it('aplica RN-01 con la clase llena del insumo (C-08)', async () => {
    const { bookClass, repository } = createUseCases();

    expect(await bookClass.execute('C-08@2026-10-07')).toEqual({ ok: false, error: 'CLASS_FULL' });
    expect((repository as FakeBookingRepository).all()).toHaveLength(0);
  });

  it('Scenario: Doble toque simultáneo en reservar', async () => {
    const { bookClass, repository } = createUseCases();

    const results = await Promise.all([bookClass.execute(YOGA_TOMORROW), bookClass.execute(YOGA_TOMORROW)]);

    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toEqual([err('ALREADY_BOOKED')]);
    expect((repository as FakeBookingRepository).all()).toHaveLength(1);
  });

  it('Scenario: Solicitudes simultáneas que superarían el límite', async () => {
    const { bookClass, repository } = createUseCases({
      bookings: [aBooking({ id: 'B-0', classId: 'C-05', sessionDate: TOMORROW })],
    });

    const results = await Promise.all([bookClass.execute('C-06@2026-10-07'), bookClass.execute(YOGA_TOMORROW)]);

    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toEqual([err('DAILY_LIMIT_REACHED')]);
    expect((repository as FakeBookingRepository).all()).toHaveLength(2);
  });

  it('sin la cola serial, dos toques simultáneos crearían una reserva duplicada (prueba de control)', async () => {
    const { bookClass, repository } = createUseCases({ queue: passThroughQueue });

    await Promise.all([bookClass.execute(YOGA_TOMORROW), bookClass.execute(YOGA_TOMORROW)]);

    expect((repository as FakeBookingRepository).all()).toHaveLength(2);
  });

  it('aplica las reglas inyectadas en el orden recibido (abierto/cerrado)', async () => {
    const alwaysFull = { check: () => err('CLASS_FULL' as const) };
    const { bookClass } = createUseCases({ bookingRules: [alwaysFull] });

    expect(await bookClass.execute(YOGA_TOMORROW)).toEqual({ ok: false, error: 'CLASS_FULL' });
  });

  it('si no se puede guardar, no crea la reserva y devuelve UNEXPECTED', async () => {
    const repository = new FakeBookingRepository();
    repository.failWrites = true;
    const { bookClass, logger } = createUseCases({ repository });

    expect(await bookClass.execute(YOGA_TOMORROW)).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(repository.all()).toHaveLength(0);
    expect(logger.events()).toEqual(['bookings.write_failed']);
  });
});
