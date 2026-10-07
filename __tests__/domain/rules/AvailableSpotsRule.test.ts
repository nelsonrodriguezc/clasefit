import { AvailableSpotsRule } from '@/domain/rules/AvailableSpotsRule';

import { aSession, TUESDAY_10AM_BOGOTA } from '../../support/builders';

describe('RN-01 · No reservar clases sin cupos (AvailableSpotsRule)', () => {
  const rule = new AvailableSpotsRule();

  it('Scenario: Reserva rechazada por clase llena', () => {
    const session = aSession({ capacity: 30, takenByOthers: 30 });

    expect(rule.check({ session, memberBookings: [], now: TUESDAY_10AM_BOGOTA })).toEqual({
      ok: false,
      error: 'CLASS_FULL',
    });
  });

  it('Scenario: Reserva del último cupo disponible', () => {
    const session = aSession({ capacity: 15, takenByOthers: 14 });

    expect(rule.check({ session, memberBookings: [], now: TUESDAY_10AM_BOGOTA }).ok).toBe(true);
  });
});
