import { SessionNotStartedRule } from '@/domain/rules/SessionNotStartedRule';

import { aSession, TUESDAY_10AM_BOGOTA } from '../../support/builders';

describe('Clases iniciadas no se pueden reservar (SessionNotStartedRule)', () => {
  const rule = new SessionNotStartedRule();
  const now = TUESDAY_10AM_BOGOTA;

  it('Scenario: Reserva de una clase que ya comenzó', () => {
    expect(rule.check({ session: aSession({ startsAt: now }), memberBookings: [], now })).toEqual({
      ok: false,
      error: 'SESSION_ALREADY_STARTED',
    });
  });

  it('permite reservar una clase que aún no comienza', () => {
    expect(rule.check({ session: aSession({ startsAt: now + 1 }), memberBookings: [], now }).ok).toBe(true);
  });
});
