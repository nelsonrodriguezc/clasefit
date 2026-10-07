import { parseBusinessDate } from '@/domain/time/businessTime';
import { dayChipText, dayLabel, firstNameOf, initialsOf, spotsLabel, timeLabel } from '@/presentation/formatters';

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

  it('dayChipText: "Hoy" con su fecha debajo; los días siguientes, solo la fecha', () => {
    expect(dayChipText(0, parseBusinessDate('2026-10-06'))).toEqual({ title: 'Hoy', subtitle: 'Mar 6 oct' });
    expect(dayChipText(1, parseBusinessDate('2026-10-07'))).toEqual({ title: 'Mié 7 oct', subtitle: null });
    expect(dayChipText(2, parseBusinessDate('2026-10-08'))).toEqual({ title: 'Jue 8 oct', subtitle: null });
  });

  it.each([
    ['Laura Gómez', 'Laura', 'LG'],
    ['  Marta   Ruiz López ', 'Marta', 'MR'],
    ['laura', 'laura', 'L'],
    ['', '', ''],
  ])('el nombre "%s" da el primer nombre "%s" y las iniciales "%s"', (name, firstName, initials) => {
    expect(firstNameOf(name)).toBe(firstName);
    expect(initialsOf(name)).toBe(initials);
  });
});
