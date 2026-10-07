import { parseBusinessDate, parseLocalTime, sessionStart } from '@/domain/time/businessTime';

import { aBooking, at, DAY_AFTER_TOMORROW, LAURA, TODAY, TOMORROW } from '../support/builders';
import { FakeBookingRepository } from '../support/fakes';
import { createUseCases } from '../support/useCaseHarness';

describe('ListMyBookings', () => {
  it('Scenario: Reservas ordenadas por proximidad', async () => {
    const { listMyBookings } = createUseCases({
      bookings: [
        aBooking({ id: 'B-yoga', classId: 'C-10', className: 'Yoga', sessionDate: DAY_AFTER_TOMORROW, startsAt: sessionStart(DAY_AFTER_TOMORROW, parseLocalTime('09:00')) }),
        aBooking({ id: 'B-spin', classId: 'C-05', className: 'Spinning', sessionDate: TOMORROW, startsAt: sessionStart(TOMORROW, parseLocalTime('06:00')) }),
      ],
    });

    const result = await listMyBookings.execute();

    expect(result.ok && result.value.map((booking) => booking.id)).toEqual(['B-spin', 'B-yoga']);
    expect(result.ok && result.value.map((booking) => booking.daysFromToday)).toEqual([1, 2]);
  });

  it('Scenario: Reservas de clases ya comenzadas no aparecen', async () => {
    const { listMyBookings } = createUseCases({
      now: at('2026-10-06T07:00:00-05:00'),
      bookings: [aBooking({ id: 'B-early', classId: 'C-01', sessionDate: TODAY, startsAt: sessionStart(TODAY, parseLocalTime('06:00')) })],
    });

    expect(await listMyBookings.execute()).toEqual({ ok: true, value: [] });
  });

  it('Scenario: Sin reservas', async () => {
    const { listMyBookings } = createUseCases();

    expect(await listMyBookings.execute()).toEqual({ ok: true, value: [] });
  });

  it('solo lista reservas de la socia autenticada', async () => {
    const { listMyBookings } = createUseCases({
      bookings: [aBooking({ id: 'B-other', memberId: 'S-0002' }), aBooking({ id: 'B-mine', memberId: LAURA.id })],
    });

    const result = await listMyBookings.execute();

    expect(result.ok && result.value.map((booking) => booking.id)).toEqual(['B-mine']);
  });

  it('devuelve UNEXPECTED si no se pueden leer las reservas', async () => {
    const repository = new FakeBookingRepository();
    repository.failReads = true;
    const { listMyBookings, logger } = createUseCases({ repository });

    expect(await listMyBookings.execute()).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(logger.events()).toEqual(['bookings.read_failed']);
  });

  it('calcula los días desde hoy con la fecha de Bogotá', async () => {
    const { listMyBookings } = createUseCases({
      now: at('2026-10-06T23:30:00-05:00'),
      bookings: [aBooking({ sessionDate: parseBusinessDate('2026-10-07') })],
    });

    const result = await listMyBookings.execute();

    expect(result.ok && result.value[0]?.daysFromToday).toBe(1);
  });
});
