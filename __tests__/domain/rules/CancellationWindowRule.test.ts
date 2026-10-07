import { CancellationWindowRule } from '@/domain/rules/CancellationWindowRule';
import { HOUR_MS, MINUTE_MS } from '@/domain/time/businessTime';

import { aBooking, TUESDAY_10AM_BOGOTA } from '../../support/builders';

describe('RN-04 · Cancelar solo hasta 2 horas antes (CancellationWindowRule)', () => {
  const rule = new CancellationWindowRule(2 * HOUR_MS);
  const now = TUESDAY_10AM_BOGOTA;
  const bookingStartingIn = (ms: number) => aBooking({ startsAt: now + ms });

  it('Scenario: Cancelación con más de 2 horas de anticipación', () => {
    expect(rule.check({ booking: bookingStartingIn(3 * HOUR_MS), now }).ok).toBe(true);
  });

  it('Scenario: Cancelación exactamente 2 horas antes', () => {
    expect(rule.check({ booking: bookingStartingIn(2 * HOUR_MS), now }).ok).toBe(true);
  });

  it('Scenario: Cancelación con menos de 2 horas', () => {
    expect(rule.check({ booking: bookingStartingIn(HOUR_MS + 59 * MINUTE_MS), now })).toEqual({
      ok: false,
      error: 'CANCELLATION_WINDOW_CLOSED',
    });
  });

  it('rechaza a 1 ms del borde de 2 horas', () => {
    expect(rule.check({ booking: bookingStartingIn(2 * HOUR_MS - 1), now }).ok).toBe(false);
  });

  it('rechaza cuando la clase ya comenzó', () => {
    expect(rule.check({ booking: bookingStartingIn(-MINUTE_MS), now }).ok).toBe(false);
  });
});
