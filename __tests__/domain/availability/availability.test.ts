import { availableSpots, isBookedBy } from '@/domain/availability/availability';

import { aBooking, aSession, TODAY, TOMORROW } from '../../support/builders';

describe('Cupos disponibles', () => {
  it('Scenario: Cupos disponibles descuentan los ocupados por otros socios', () => {
    const session = aSession({ capacity: 20, takenByOthers: 15 });

    expect(availableSpots(session, [])).toBe(5);
  });

  it('Scenario: Cupos disponibles incluyen la reserva de la socia', () => {
    const session = aSession({ classId: 'C-02', capacity: 15, takenByOthers: 9 });
    const bookings = [aBooking({ classId: 'C-02', sessionDate: session.date })];

    expect(availableSpots(session, bookings)).toBe(5);
  });

  it('nunca devuelve cupos negativos aunque los datos estén inconsistentes', () => {
    const session = aSession({ capacity: 12, takenByOthers: 12 });
    const bookings = [aBooking({ sessionDate: session.date })];

    expect(availableSpots(session, bookings)).toBe(0);
  });

  it('una reserva de la misma clase en otra fecha no ocupa cupo en esta sesión', () => {
    const session = aSession({ date: TOMORROW, capacity: 20, takenByOthers: 15 });
    const bookings = [aBooking({ sessionDate: TODAY })];

    expect(isBookedBy(session, bookings)).toBe(false);
    expect(availableSpots(session, bookings)).toBe(5);
  });
});
