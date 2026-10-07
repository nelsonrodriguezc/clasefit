import { parseBusinessDate } from '@/domain/time/businessTime';
import { dayLabel, spotsLabel, timeLabel } from '@/presentation/formatters';

import { at } from '../support/builders';

describe('Formatos de la interfaz', () => {
  it.each([
    [0, '2026-10-06', 'Hoy · mar 6 oct'],
    [1, '2026-10-07', 'Mañana · mié 7 oct'],
    [2, '2026-10-08', 'Pasado mañana · jue 8 oct'],
    [5, '2027-01-01', 'vie 1 ene'],
  ])('dayLabel(%p, %s) = "%s"', (daysFromToday, date, expected) => {
    expect(dayLabel(daysFromToday, parseBusinessDate(date))).toBe(expected);
  });

  it('timeLabel muestra la hora de inicio en Bogotá (HH:mm)', () => {
    expect(timeLabel(at('2026-10-07T18:00:00-05:00'))).toBe('18:00');
    expect(timeLabel(at('2026-10-07T06:00:00-05:00'))).toBe('06:00');
  });

  it('spotsLabel usa el formato del insumo "5 de 20 cupos"', () => {
    expect(spotsLabel(5, 20)).toBe('5 de 20 cupos');
    expect(spotsLabel(1, 15)).toBe('1 de 15 cupos');
  });
});
