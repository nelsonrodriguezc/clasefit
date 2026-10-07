import { DailyBookingLimitRule } from '@/domain/rules/DailyBookingLimitRule';
import { parseLocalTime, sessionStart } from '@/domain/time/businessTime';

import { aBooking, aSession, TODAY, TOMORROW, TUESDAY_10AM_BOGOTA } from '../../support/builders';

describe('RN-03 · Máximo 2 reservas por día de clase (DailyBookingLimitRule)', () => {
  const rule = new DailyBookingLimitRule(2);
  const now = TUESDAY_10AM_BOGOTA;

  it('Scenario: Tercera reserva del mismo día', () => {
    const memberBookings = [
      aBooking({ id: 'B-1', classId: 'C-05', sessionDate: TOMORROW }),
      aBooking({ id: 'B-2', classId: 'C-06', sessionDate: TOMORROW }),
    ];
    const session = aSession({ classId: 'C-07', date: TOMORROW });

    expect(rule.check({ session, memberBookings, now })).toEqual({ ok: false, error: 'DAILY_LIMIT_REACHED' });
  });

  it('Scenario: Reservas en días distintos', () => {
    const memberBookings = [
      aBooking({ id: 'B-1', classId: 'C-02', sessionDate: TODAY }),
      aBooking({ id: 'B-2', classId: 'C-04', sessionDate: TODAY }),
    ];
    const session = aSession({ classId: 'C-05', date: TOMORROW });

    expect(rule.check({ session, memberBookings, now }).ok).toBe(true);
  });

  it('Scenario: El límite cuenta clases del día que ya comenzaron', () => {
    const startedThisMorning = sessionStart(TODAY, parseLocalTime('06:00'));
    const memberBookings = [
      aBooking({ id: 'B-1', classId: 'C-01', sessionDate: TODAY, startsAt: startedThisMorning }),
      aBooking({ id: 'B-2', classId: 'C-02', sessionDate: TODAY }),
    ];
    const session = aSession({ classId: 'C-04', date: TODAY });

    expect(startedThisMorning).toBeLessThan(now);
    expect(rule.check({ session, memberBookings, now })).toEqual({ ok: false, error: 'DAILY_LIMIT_REACHED' });
  });

  it('permite la segunda reserva del día', () => {
    const memberBookings = [aBooking({ id: 'B-1', classId: 'C-05', sessionDate: TOMORROW })];
    const session = aSession({ classId: 'C-06', date: TOMORROW });

    expect(rule.check({ session, memberBookings, now }).ok).toBe(true);
  });

  it('el límite es configurable sin modificar la regla (abierto/cerrado)', () => {
    const memberBookings = [
      aBooking({ id: 'B-1', classId: 'C-05', sessionDate: TOMORROW }),
      aBooking({ id: 'B-2', classId: 'C-06', sessionDate: TOMORROW }),
    ];
    const session = aSession({ classId: 'C-07', date: TOMORROW });

    expect(new DailyBookingLimitRule(3).check({ session, memberBookings, now }).ok).toBe(true);
  });
});
