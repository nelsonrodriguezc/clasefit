import {
  addDays,
  businessDateOf,
  daysBetween,
  hasStarted,
  HOUR_MS,
  parseBusinessDate,
  parseLocalTime,
  sessionStart,
  weekdayOf,
} from '@/domain/time/businessTime';

import { at } from '../../support/builders';

// The whole suite runs with TZ=Pacific/Kiritimati (UTC+14): any use of local Date getters
// would move these results by a day.
describe('Hora de negocio (America/Bogota, UTC-5)', () => {
  describe('businessDateOf', () => {
    it('usa la fecha de Bogotá y no la del dispositivo', () => {
      // 22:00 del 6 de octubre en Bogotá = 03:00 UTC del 7 = 17:00 del 7 en Kiritimati.
      expect(businessDateOf(at('2026-10-07T03:00:00Z'))).toBe('2026-10-06');
    });

    it('cambia de día exactamente a la medianoche de Bogotá', () => {
      expect(businessDateOf(at('2026-10-06T23:59:59.999-05:00'))).toBe('2026-10-06');
      expect(businessDateOf(at('2026-10-07T00:00:00-05:00'))).toBe('2026-10-07');
    });
  });

  describe('sessionStart', () => {
    it('Scenario: Fecha calculada en hora de Bogotá aunque el dispositivo esté en otra zona', () => {
      const today = businessDateOf(at('2026-10-06T10:00:00-05:00'));
      const tomorrow = addDays(today, 1);

      const startsAt = sessionStart(tomorrow, parseLocalTime('18:00'));

      expect(new Date(startsAt).toISOString()).toBe('2026-10-07T23:00:00.000Z');
    });

    it('interpreta la hora del catálogo como hora local de Bogotá', () => {
      expect(sessionStart(parseBusinessDate('2026-10-06'), parseLocalTime('06:00'))).toBe(at('2026-10-06T11:00:00Z'));
    });
  });

  describe('addDays', () => {
    it('cruza el fin de mes', () => {
      expect(addDays(parseBusinessDate('2026-10-31'), 2)).toBe('2026-11-02');
    });

    it('cruza el fin de año', () => {
      expect(addDays(parseBusinessDate('2026-12-31'), 1)).toBe('2027-01-01');
    });

    it('respeta los años bisiestos', () => {
      expect(addDays(parseBusinessDate('2028-02-28'), 1)).toBe('2028-02-29');
    });
  });

  describe('daysBetween', () => {
    it('cuenta días calendario entre dos fechas de negocio', () => {
      expect(daysBetween(parseBusinessDate('2026-10-06'), parseBusinessDate('2026-10-08'))).toBe(2);
      expect(daysBetween(parseBusinessDate('2026-10-06'), parseBusinessDate('2026-10-05'))).toBe(-1);
    });
  });

  describe('weekdayOf', () => {
    it('devuelve el día de la semana de la fecha de negocio (0 = domingo)', () => {
      expect(weekdayOf(parseBusinessDate('2026-10-06'))).toBe(2);
      expect(weekdayOf(parseBusinessDate('2027-01-01'))).toBe(5);
    });
  });

  describe('hasStarted', () => {
    it('Scenario: Clase que comienza en este instante no aparece (inicio igual a ahora cuenta como iniciada)', () => {
      const startsAt = at('2026-10-06T19:00:00-05:00');

      expect(hasStarted(startsAt, startsAt)).toBe(true);
      expect(hasStarted(startsAt, startsAt - 1)).toBe(false);
      expect(hasStarted(startsAt, startsAt + HOUR_MS)).toBe(true);
    });
  });

  describe('validación de formatos', () => {
    it.each(['2026-02-30', '2026/10/06', '2026-1-6', '', 'mañana'])('rechaza la fecha inválida "%s"', (value) => {
      expect(() => parseBusinessDate(value)).toThrow(RangeError);
    });

    it.each(['24:00', '6:00', '18:60', '18-00', ''])('rechaza la hora inválida "%s"', (value) => {
      expect(() => parseLocalTime(value)).toThrow(RangeError);
    });

    it('acepta horas HH:mm válidas', () => {
      expect(parseLocalTime('06:00')).toEqual({ hours: 6, minutes: 0 });
      expect(parseLocalTime('23:59')).toEqual({ hours: 23, minutes: 59 });
    });
  });
});
