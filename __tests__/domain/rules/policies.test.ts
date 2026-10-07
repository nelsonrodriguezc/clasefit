import { defaultBookingRules, defaultCancellationRules, MAX_BOOKINGS_PER_DAY } from '@/domain/rules/policies';
import { evaluateRules } from '@/domain/rules/Rule';
import { HOUR_MS } from '@/domain/time/businessTime';

import { aBooking, aSession, TOMORROW, TUESDAY_10AM_BOGOTA } from '../../support/builders';

describe('Prioridad de mensajes cuando fallan varias reglas (políticas por defecto)', () => {
  const now = TUESDAY_10AM_BOGOTA;
  const rules = defaultBookingRules();

  it('Scenario: Clase ya reservada y sin cupos', () => {
    const session = aSession({ classId: 'C-06', date: TOMORROW, capacity: 15, takenByOthers: 14 });
    const memberBookings = [aBooking({ classId: 'C-06', sessionDate: TOMORROW })];

    expect(evaluateRules(rules, { session, memberBookings, now })).toEqual({ ok: false, error: 'ALREADY_BOOKED' });
  });

  it('Scenario: Clase sin cupos con el límite diario alcanzado', () => {
    const memberBookings = [
      aBooking({ id: 'B-1', classId: 'C-05', sessionDate: TOMORROW }),
      aBooking({ id: 'B-2', classId: 'C-06', sessionDate: TOMORROW }),
    ];
    const session = aSession({ classId: 'C-08', date: TOMORROW, capacity: 30, takenByOthers: 30 });

    expect(evaluateRules(rules, { session, memberBookings, now })).toEqual({ ok: false, error: 'CLASS_FULL' });
  });

  it('informa primero que la clase ya comenzó, antes que cualquier otra regla', () => {
    const session = aSession({ capacity: 10, takenByOthers: 10, startsAt: now - HOUR_MS });

    expect(evaluateRules(rules, { session, memberBookings: [], now })).toEqual({
      ok: false,
      error: 'SESSION_ALREADY_STARTED',
    });
  });

  it('aprueba una reserva que cumple todas las reglas', () => {
    expect(evaluateRules(rules, { session: aSession(), memberBookings: [], now }).ok).toBe(true);
  });

  it('usa el límite de 2 reservas por día del insumo', () => {
    expect(MAX_BOOKINGS_PER_DAY).toBe(2);
  });

  it('aplica RN-04 como política de cancelación por defecto', () => {
    const booking = aBooking({ startsAt: now + HOUR_MS });

    expect(evaluateRules(defaultCancellationRules(), { booking, now })).toEqual({
      ok: false,
      error: 'CANCELLATION_WINDOW_CLOSED',
    });
  });
});
