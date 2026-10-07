import { datePartsOf, formatLocalTime, localTimeOf, parseBusinessDate } from '@/domain/time/businessTime';

import { at } from '../../support/builders';

describe('Partes de fecha y hora para mostrar (Bogotá)', () => {
  it('localTimeOf devuelve la hora de Bogotá de un instante, sin depender de la zona del dispositivo', () => {
    expect(localTimeOf(at('2026-10-07T23:00:00Z'))).toEqual({ hours: 18, minutes: 0 });
    expect(localTimeOf(at('2026-10-07T05:30:00Z'))).toEqual({ hours: 0, minutes: 30 });
  });

  it('formatLocalTime usa el formato HH:mm de 24 horas', () => {
    expect(formatLocalTime({ hours: 6, minutes: 5 })).toBe('06:05');
    expect(formatLocalTime({ hours: 18, minutes: 0 })).toBe('18:00');
  });

  it('datePartsOf separa año, mes y día de una fecha de negocio', () => {
    expect(datePartsOf(parseBusinessDate('2026-10-07'))).toEqual({ year: 2026, month: 10, day: 7 });
  });
});
