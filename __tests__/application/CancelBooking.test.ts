import { HOUR_MS, MINUTE_MS } from '@/domain/time/businessTime';

import { aBooking, LAURA, TOMORROW, TUESDAY_10AM_BOGOTA } from '../support/builders';
import { FakeBookingRepository } from '../support/fakes';
import { createUseCases } from '../support/useCaseHarness';

const now = TUESDAY_10AM_BOGOTA;

describe('CancelBooking', () => {
  it('Scenario: Cancelación confirmada (la reserva se elimina)', async () => {
    const repository = new FakeBookingRepository([aBooking({ id: 'B-1', startsAt: now + 3 * HOUR_MS })]);
    const { cancelBooking } = createUseCases({ repository });

    expect(await cancelBooking.check('B-1')).toEqual({ ok: true, value: undefined });
    expect(await cancelBooking.execute('B-1')).toEqual({ ok: true, value: undefined });
    expect(repository.all()).toHaveLength(0);
  });

  it('check informa RN-04 sin eliminar la reserva cuando faltan menos de 2 horas', async () => {
    const repository = new FakeBookingRepository([aBooking({ id: 'B-1', startsAt: now + HOUR_MS })]);
    const { cancelBooking } = createUseCases({ repository });

    expect(await cancelBooking.check('B-1')).toEqual({ ok: false, error: 'CANCELLATION_WINDOW_CLOSED' });
    expect(repository.all()).toHaveLength(1);
  });

  it('Scenario: El plazo vence mientras se confirma', async () => {
    const repository = new FakeBookingRepository([aBooking({ id: 'B-1', startsAt: now + 2 * HOUR_MS + MINUTE_MS })]);
    const harness = createUseCases({ repository });

    expect((await harness.cancelBooking.check('B-1')).ok).toBe(true);
    harness.clock.advance(2 * MINUTE_MS);

    expect(await harness.cancelBooking.execute('B-1')).toEqual({ ok: false, error: 'CANCELLATION_WINDOW_CLOSED' });
    expect(repository.all()).toHaveLength(1);
  });

  it('Scenario: Cancelar libera el límite diario', async () => {
    const repository = new FakeBookingRepository([
      aBooking({ id: 'B-1', classId: 'C-05', sessionDate: TOMORROW }),
      aBooking({ id: 'B-2', classId: 'C-06', sessionDate: TOMORROW }),
    ]);
    const { cancelBooking, bookClass } = createUseCases({ repository });

    expect(await bookClass.execute('C-07@2026-10-07')).toEqual({ ok: false, error: 'DAILY_LIMIT_REACHED' });
    expect((await cancelBooking.execute('B-1')).ok).toBe(true);
    expect((await bookClass.execute('C-07@2026-10-07')).ok).toBe(true);
  });

  it('no permite cancelar reservas de otra socia (responde como inexistente)', async () => {
    const repository = new FakeBookingRepository([aBooking({ id: 'B-other', memberId: 'S-0002', startsAt: now + 5 * HOUR_MS })]);
    const { cancelBooking } = createUseCases({ repository });

    expect(await cancelBooking.execute('B-other')).toEqual({ ok: false, error: 'BOOKING_NOT_FOUND' });
    expect(repository.all()).toHaveLength(1);
  });

  it('responde BOOKING_NOT_FOUND para una reserva inexistente', async () => {
    const { cancelBooking } = createUseCases();

    expect(await cancelBooking.check('B-404')).toEqual({ ok: false, error: 'BOOKING_NOT_FOUND' });
  });

  it('si no se puede guardar, conserva la reserva y devuelve UNEXPECTED', async () => {
    const repository = new FakeBookingRepository([aBooking({ id: 'B-1', memberId: LAURA.id, startsAt: now + 5 * HOUR_MS })]);
    const { cancelBooking, logger } = createUseCases({ repository });
    repository.failWrites = true;

    expect(await cancelBooking.execute('B-1')).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(repository.all()).toHaveLength(1);
    expect(logger.events()).toEqual(['bookings.write_failed']);
  });
});
