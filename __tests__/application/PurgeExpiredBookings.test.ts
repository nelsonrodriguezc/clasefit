import { parseBusinessDate, parseLocalTime, sessionStart } from '@/domain/time/businessTime';

import { aBooking, at, TODAY, TOMORROW } from '../support/builders';
import { FakeBookingRepository } from '../support/fakes';
import { createUseCases } from '../support/useCaseHarness';

const YESTERDAY = parseBusinessDate('2026-10-05');

describe('PurgeExpiredBookings', () => {
  it('Scenario: Reservas de días anteriores se eliminan', async () => {
    const repository = new FakeBookingRepository([
      aBooking({ id: 'B-yesterday', sessionDate: YESTERDAY, startsAt: sessionStart(YESTERDAY, parseLocalTime('18:00')) }),
      aBooking({ id: 'B-tomorrow', sessionDate: TOMORROW }),
    ]);
    const { purgeExpiredBookings } = createUseCases({ repository });

    expect(await purgeExpiredBookings.execute()).toEqual({ ok: true, value: 1 });
    expect(repository.all().map((booking) => booking.id)).toEqual(['B-tomorrow']);
  });

  it('conserva las reservas de hoy aunque su clase ya haya comenzado (cuentan para RN-03)', async () => {
    const repository = new FakeBookingRepository([
      aBooking({ id: 'B-today', sessionDate: TODAY, startsAt: sessionStart(TODAY, parseLocalTime('06:00')) }),
    ]);
    const { purgeExpiredBookings } = createUseCases({ repository, now: at('2026-10-06T21:00:00-05:00') });

    expect(await purgeExpiredBookings.execute()).toEqual({ ok: true, value: 0 });
    expect(repository.all()).toHaveLength(1);
  });

  it('devuelve UNEXPECTED si no puede guardar la purga', async () => {
    const repository = new FakeBookingRepository([aBooking({ id: 'B-yesterday', sessionDate: YESTERDAY })]);
    repository.failWrites = true;
    const { purgeExpiredBookings, logger } = createUseCases({ repository });

    expect(await purgeExpiredBookings.execute()).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(logger.events()).toEqual(['bookings.write_failed']);
  });
});
