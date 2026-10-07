import { NoDuplicateBookingRule } from '@/domain/rules/NoDuplicateBookingRule';

import { aBooking, aSession, TODAY, TOMORROW, TUESDAY_10AM_BOGOTA } from '../../support/builders';

describe('RN-02 · No reservar la misma clase dos veces (NoDuplicateBookingRule)', () => {
  const rule = new NoDuplicateBookingRule();

  it('Scenario: Segunda reserva de la misma clase', () => {
    const session = aSession({ classId: 'C-07', date: TOMORROW });
    const memberBookings = [aBooking({ classId: 'C-07', sessionDate: TOMORROW })];

    expect(rule.check({ session, memberBookings, now: TUESDAY_10AM_BOGOTA })).toEqual({
      ok: false,
      error: 'ALREADY_BOOKED',
    });
  });

  it('permite reservar la misma clase del catálogo en otra fecha (otra sesión)', () => {
    const session = aSession({ classId: 'C-07', date: TOMORROW });
    const memberBookings = [aBooking({ classId: 'C-07', sessionDate: TODAY })];

    expect(rule.check({ session, memberBookings, now: TUESDAY_10AM_BOGOTA }).ok).toBe(true);
  });
});
